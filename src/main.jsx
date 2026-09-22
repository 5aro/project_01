import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
const friends = [
    { name: '치이카와', icon: 'https://i.namu.wiki/i/CHY4l2dwG8c2anpQqFODjdLN7_yNPpgNl0IYHf3mVN_2RVIPQ0AMC52YUoq-UWwJxfVhzCcT6E6j3_hFmeQOOPepwOJGPp3oLSA74t9Ao8SVMPWZQwJEj2BGql0TGwHS7KatRT_lnFXk9aYpgkKeFA.webp', color: '#f5dfe5', tag: '조금 수줍어도, 다정하게', description: '작고 소심하지만 누구보다 상냥한 친구', greeting: '어… 와 줬구나…! 오늘은 어떤 하루였어?', prompts: ['오늘 조금 힘들었어', '나 오늘 칭찬받았어!', '같이 간식 먹을까?'] },
    { name: '하치와레', icon: 'https://i.namu.wiki/i/JCLcbtXpAzpChokfwgeK3YUpWL6-4wkMQ1AIxHmp6JLNctIoGMCnJwE0JCU1De9kR830kCRkNyuJ4r0-gvLjCR1V4xHiwpsmKx6AUE8JV2BzYHuubNWg35KOqtOsLDBkjlWBC2NtAJg5cI1ONnfO3Q.webp', color: '#dcebf6', tag: '함께라면 어떻게든 돼!', description: '밝은 마음으로 이야기를 들어주는 친구', greeting: '와, 반가워! 무슨 일 있었어? 들려줘!', prompts: ['새로운 일을 시작하고 싶어', '기분 좋은 일이 있었어', '좋아하는 음식이 뭐야?'] },
    { name: '우사기', icon: 'https://i.namu.wiki/i/e2maHvhurKpvHe9zsjzp37wTCN0WtpqLrBKlEHhJa5eKsdzavGuDy7IG2Rd9yXc_j0_O24OyUspO7RAh_kGSk_QLGf4rWMiddgf7weo-gkUZEleQgth35Olf6Ke0KUZR0K_IijymnQDW2coO32dhTw.webp', color: '#fbefcd', tag: '오늘도 신나게, 야하!', description: '엉뚱하고 자유로운 에너지 가득한 친구', greeting: '야하! 왔어?! 같이 놀자!!', prompts: ['심심해! 같이 놀자', '맛있는 거 먹으러 갈까?', '도전할 용기가 필요해'] },
    { name: '모몽가', icon: 'https://i.namu.wiki/i/DNFNWjT-HFgy5QsAW3cINU6WJl3vWnGH6fFOsJwHzyb1n0MkRqNS1vKV7e7frA3sBMfG5WkQ2WXxJwGTjI86w7JK6iOqBAUNemKCWFXEMwt2PNaRzlfjlFB5XmP8pkkAzRBUN5nBhYYcm08UP65R7Q.webp', color: '#e9e1f4', tag: '귀여운 내가 들어줄게', description: '관심과 칭찬을 좋아하는 장난스러운 친구', greeting: '왔구나! 오늘도 나 귀엽지? 무슨 이야기 할래?', prompts: ['오늘도 정말 귀엽네', '내 이야기 좀 들어줘', '기분 전환하고 싶어'] },
    { name: '노동갑옷', icon: 'https://static.wikia.nocookie.net/chiikawa/images/7/7e/TheLaborYoroiSan.png/revision/latest?cb=20241020044616&path-prefix=ko', color: '#dfebe3', tag: '천천히, 하나씩 해보자', description: '무뚝뚝해 보여도 따뜻하게 챙겨주는 친구', greeting: '왔나. 잠깐 쉬면서 얘기해도 된다.', prompts: ['할 일이 너무 많아', '오늘 열심히 일했어', '잠깐 쉬어가고 싶어'] }
];
function CharacterIcon({ friend }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => { setFailed(false); }, [friend.icon]);
    const isImage = /^(https?:\/\/|\/)/.test(friend.icon);
    if (!isImage) return <>{friend.icon}</>;
    if (failed) return <span title="이미지를 불러오지 못했어요. 이미지 주소를 확인해 주세요.">🐾</span>;
    return <img src={friend.icon} alt={friend.name} className="character-image" onError={() => setFailed(true)} />;
}
function ResultModal({ analyzing, result, error, onClose, onRetry, onReset }) {
    const dialog = useRef(null);
    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        return () => { element.close(); };
    }, []);
    //const match = friends.find(f=>)
    const match = friends.find(f => f.name === result?.similar_character);
    return <dialog ref={dialog} className="result-modal" aria-labelledby="result-title" onCancel={e => { e.preventDefault(); if (!analyzing) onClose(); }}>
        {!analyzing && <button className="modal-close" aria-label="결과 창 닫기" onClick={onClose}>×</button>}
        <div aria-live="polite" aria-busy={analyzing}>
            <span className="eyebrow">MY LITTLE CHARACTER</span>
            <h2 id="result-title">{analyzing ? '나와 닮은 친구를 찾고 있어요' : result ? '나와 닮은 먼작귀 친구는?' : '잠시만요'}</h2>
            {analyzing ? <><div className="analysis-spinner" /><p>친구들과 나눈 이야기를 돌아보고 있어요.<br />첫 분석은 조금 더 걸릴 수 있어요.</p></> : result ? <>
                {match && <div className="result-avatar" style={{ background: match.color }}><CharacterIcon friend={match} /></div>}
                <h3 className="result-name">{result.similar_character}</h3>
                {result.character_description && <p className="result-note">{result.character_description}</p>}
                {result.match_reason && <div className="match-reason"><strong>이런 점이 닮았어요</strong><p>{result.match_reason}</p></div>}
                <dl className="result-details">
                    <div><dt>🍀 행운 아이템</dt><dd>{result.lucky_item}</dd></div>
                    <div><dt>🍰 힐링 음식</dt><dd>{result.healing_food}</dd></div>
                    <div><dt>🤝 나와 잘 맞는 친구</dt><dd>{result.best_friend}</dd></div>
                    <div><dt>💥 티격태격할 친구</dt><dd>{result.crazy_tiki_taka}</dd></div>
                </dl>
                <p className="result-note">지금까지의 대화를 바탕으로 한 재미로 보는 결과예요.</p>
                <div className="modal-actions"><button onClick={onClose}>대화 이어가기</button><button className="primary" onClick={onReset}>새 대화 시작</button></div>
            </> : <><p className="error" role="alert">{error}</p><div className="modal-actions"><button onClick={onClose}>대화로 돌아가기</button><button className="primary" onClick={onRetry}>다시 분석하기</button></div></>}
        </div>
    </dialog>;
}
function App() {
    const [selected, setSelected] = useState(0), [conversations, setConversations] = useState({}), [draft, setDraft] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const [session, setSession] = useState(() => crypto.randomUUID());
    const [analyzing, setAnalyzing] = useState(false), [result, setResult] = useState(null), [resultError, setResultError] = useState(''), [showResult, setShowResult] = useState(false);
    const pending = useRef(false);
    const inputRef = useRef(null);
    useEffect(() => {
        if (!busy && !analyzing && !showResult) {
            inputRef.current?.focus({ preventScroll: true });
        }
    }, [busy, analyzing, showResult]);
    const locked = busy || analyzing;
    const hasConversation = Object.values(conversations).some(items => items.some(m => m.role === 'assistant'));
    const bottom = useRef(null); const friend = friends[selected]; const messages = conversations[friend.name] || [];
    useEffect(() => {
        bottom.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, busy, selected]);
    async function send(text = draft) {
        text = text.trim(); if (!text || pending.current) return;
        pending.current = true;
        const name = friend.name; setDraft(''); setError(''); setBusy(true);
        setConversations(old => ({ ...old, [name]: [...(old[name] || []), { role: 'user', text }] }));
        try {
            const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ character: name, message: text, session_id: session }) });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw Error(data.error || '응답을 받지 못했어요. Python 서버 실행 상태를 확인해 주세요.');
            setResult(null);
            setConversations(old => ({ ...old, [name]: [...(old[name] || []), { role: 'assistant', text: data.reply }] }));
        } catch (e) {
            setError(e.message || '서버에 연결할 수 없어요.'); setDraft(text);
            setConversations(old => ({ ...old, [name]: (old[name] || []).slice(0, -1) }));
        } finally { pending.current = false; setBusy(false) }
    }
    async function finish() {
        if (pending.current || !hasConversation) return;
        setShowResult(true);
        if (result) return;
        pending.current = true; setAnalyzing(true); setResultError('');
        try {
            const response = await fetch('/api/finish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: session }) });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw Error(data.error || '분석 요청에 실패했어요. Python 서버를 재시작한 후 다시 시도해 주세요.');
            const value = data.result;
            if (!value || !friends.some(f => f.name === value.similar_character) || ['personality_summary', 'lucky_item', 'healing_food', 'best_friend', 'crazy_tiki_taka'].some(k => typeof value[k] !== 'string')) throw Error('분석 결과를 읽지 못했어요. 다시 시도해 주세요.');
            setResult(value);
        } catch (e) { setResultError(e.message || '분석 서버에 연결할 수 없어요.'); }
        finally { pending.current = false; setAnalyzing(false); }
    }
    function reset() {
        if (pending.current) return;
        setConversations({}); setSession(crypto.randomUUID()); setError(''); setDraft('');
        setResult(null); setResultError(''); setShowResult(false);
    }
    return <div className="app"><header><a className="brand" href="/">𐂜<span>먼작귀야 놀자!!</span></a><span className="header-note">마음이 쉬어가는 작은 대화</span><span className="fan-label">먼작귀 팬 프로젝트</span></header>
        <main><section className="intro"><span className="eyebrow">A LITTLE MOMENT, JUST FOR YOU</span><h1>오늘의   이야기를<br className="mobile" /> 들려줄래?</h1><p>좋았던 일도, 조금 지친 마음도. 친구들이 여기서 기다리고 있어요.</p></section>
            <div className="workspace"><aside><div className="section-label">함께 이야기할 친구 <span>5</span></div><div className="friends">{friends.map((f, i) => <button className={'friend ' + (selected === i ? 'selected' : '')} key={f.name} disabled={locked} onClick={() => { setSelected(i); setError(''); setDraft('') }} aria-pressed={selected === i}><span className="avatar" style={{ background: f.color }}><CharacterIcon friend={f} /></span><span><strong>{f.name}</strong><small>{f.tag}</small></span><span className="dot">{selected === i ? '●' : ''}</span></button>)}</div><div className="aside-note"><span>☁</span><p>꼭 특별한 이야기가 아니어도 괜찮아요.<br />소소한 하루부터 시작해 보세요.</p></div></aside>
                <section className="chat" aria-label={`${friend.name}와 대화`}><div className="chat-header"><span className="avatar small" style={{ background: friend.color }}><CharacterIcon friend={friend} /></span><div><strong>{friend.name}</strong><small>{friend.description}</small></div><button className="finish" onClick={finish} disabled={locked || !hasConversation}>{result ? '결과 다시 보기' : '대화종료'}</button><button className="reset" onClick={reset} disabled={locked} title="모든 친구의 대화를 새로 시작">↻ <span>새 대화</span></button></div>
                    <div className="messages" role="log" aria-live="polite"><div className="day">우리의 작은 대화가 시작됐어요</div><div className="message assistant"><span className="mini-avatar" style={{ background: friend.color }}><CharacterIcon friend={friend} /></span><div><span className="speaker">{friend.name}</span><p>{friend.greeting}</p></div></div>
                        {messages.length === 0 && <div className="welcome"><div className="welcome-flower">𐂜</div><h2>어떤 이야기부터 시작할까요?</h2><p>아래 이야기를 고르거나, 편하게 말을 걸어보세요.</p><div className="suggestions">{friend.prompts.map(p => <button key={p} onClick={() => send(p)} disabled={locked}>{p} <span>↗</span></button>)}</div></div>}
                        {messages.map((m, i) => <div key={i} className={'message ' + m.role}>{m.role === 'assistant' && <span className="mini-avatar" style={{ background: friend.color }}><CharacterIcon friend={friend} /></span>}<div><span className="speaker">{m.role === 'user' ? '나' : friend.name}</span><p>{m.text}</p></div></div>)}
                        {busy && <div className="loading"><CharacterIcon friend={friend} /> 이야기를 생각하고 있어요<span> · · ·</span><small>처음 대화할 때는 캐릭터 정보를 검색해 조금 더 걸릴 수 있어요.</small></div>}<div ref={bottom} /></div>
                    <div className="composer-area">{result && <p className="ended-note">결과를 확인했어요. 이어서 이야기하면 다음 분석에 새 대화도 반영돼요.</p>}{error && <p className="error" role="alert">{error} 다시 보내실 수 있도록 입력 내용을 복원했어요.</p>}<form onSubmit={e => { e.preventDefault(); send() }}><textarea ref={inputRef} aria-label="메시지" placeholder={`${friend.name}에게 이야기해 주세요…`} value={draft} disabled={locked} rows={1} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() } }} /><button className="send" aria-label="메시지 보내기" disabled={locked || !draft.trim()}>↑</button></form><div className="composer-caption"><span>Enter로 전송 · Shift + Enter로 줄바꿈</span><span>작은 이야기 하나도 소중하게</span></div></div></section></div><footer>친구의 말투로 대화하는 AI예요. 캐릭터별 이야기는 서버가 실행되는 동안 기억해요.</footer></main>{showResult && <ResultModal analyzing={analyzing} result={result} error={resultError} onClose={() => setShowResult(false)} onRetry={finish} onReset={reset} />}</div>
}
createRoot(document.getElementById('root')).render(<App />);
