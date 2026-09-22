"""Local React adapter for the original terminal chatbot. Bind to localhost only."""
import importlib.util
import json
import os
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer
from uuid import UUID

DEFAULT = Path(__file__).resolve().with_name('chat.py')
SOURCE = Path(os.environ.get('CHAT_SOURCE', str(DEFAULT))).expanduser().resolve()
module = None
world_candidates = None
analysis_results = {}

def get_service():
    global module
    if module is None:
        spec = importlib.util.spec_from_file_location('original_character_chat', SOURCE)
        service = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(service)
        module = service
    return module

class Handler(BaseHTTPRequestHandler):
    def respond(self, status, body):
        payload = json.dumps(body, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path == '/api/health':
            return self.respond(200, {'ok': True, 'source_exists': SOURCE.is_file()})
        self.respond(404, {'error': '요청한 주소를 찾을 수 없어요.'})

    def do_POST(self):
        if self.path not in ('/api/chat', '/api/finish'):
            return self.respond(404, {'error': '요청한 주소를 찾을 수 없어요.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 24000:
                raise ValueError('invalid size')
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError('invalid body')
            character = data.get('character')
            # The UI uses the compact label "노동갑옷", while the original
            # character data uses "노동 갑옷". Accept both spellings at the
            # API boundary and use the canonical name internally.
            if character == '노동갑옷':
                character = '노동 갑옷'
            message = data.get('message')
            session = data.get('session_id')
            if self.path == '/api/chat' and character not in ['치이카와', '하치와레', '우사기', '모몽가', '노동 갑옷']:
                raise ValueError('invalid character')
            if self.path == '/api/chat' and (not isinstance(message, str) or not message.strip() or len(message) > 4000):
                raise ValueError('invalid message')
            if not isinstance(session, str):
                raise ValueError('invalid session')
            UUID(session)
        except (ValueError, TypeError, AttributeError):
            return self.respond(400, {'error': '캐릭터와 메시지를 확인해 주세요. 메시지는 4,000자까지 보낼 수 있어요.'})
        try:
            global world_candidates
            if self.path == '/api/finish' and session in analysis_results:
                return self.respond(200, {'result': analysis_results[session]})
            service = get_service()
            if self.path == '/api/finish':
                conversation = service.get_all_user_conversation(session)
                if not conversation.strip():
                    return self.respond(400, {'error': '분석할 대화가 없어요. 서버가 재시작됐다면 새 대화를 시작해 주세요.'})
                if world_candidates is None:
                    world_candidates = service.prepare_world_candidates()
                result = service.analyze_personality(conversation, world_candidates).model_dump()
                if result.get('similar_character') not in service.CHARACTERS:
                    raise ValueError('Unknown result character')
                required = ('similar_character', 'lucky_item', 'healing_food', 'best_friend', 'crazy_tiki_taka', 'personality_summary')
                if any(not isinstance(result.get(key), str) or not result[key].strip() for key in required):
                    raise ValueError('Incomplete analysis result')
                # Keep the API response aligned with the compact character
                # labels used by the React UI.
                if result['similar_character'] == '노동 갑옷':
                    result['similar_character'] = '노동갑옷'
                analysis_results[session] = result
                return self.respond(200, {'result': result})
            # Fetch only the selected character; cache subsequent requests.
            if character not in service.character_infos:
                service.character_infos[character] = str(service.get_character_info.invoke({'character': character}))
            reply = service.chat.invoke({
                'input': message.strip(),
                'character': character,
                'character_info': service.character_infos[character],
                'character_persona': service.CHARACTER_PERSONAS[character],
            }, config={'configurable': {'session_id': f'{session}_{character}'}})
            # A new successful turn makes the previous personality result stale.
            analysis_results.pop(session, None)
            self.respond(200, {'reply': reply})
        except Exception as exc:
            # Do not expose API keys, upstream response bodies, or private paths.
            print(f'Chat request failed: {type(exc).__name__}', flush=True)
            self.respond(503, {'error': '분석에 실패했어요. 잠시 후 다시 시도해 주세요.' if self.path == '/api/finish' else '대화 연결에 실패했어요. 기존 Python 환경의 패키지, API 키와 네트워크 연결을 확인해 주세요.'})

if __name__ == '__main__':
    print('Chat API: http://127.0.0.1:8000', flush=True)
    HTTPServer(('127.0.0.1', 8000), Handler).serve_forever()
