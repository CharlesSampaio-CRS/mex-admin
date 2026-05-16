import React, { useState } from "react";

const screenshots = [
  "/admin/assets/screenshots/IMG_3932.png",
  "/admin/assets/screenshots/IMG_3931.png",
  "/admin/assets/screenshots/IMG_3933.png",
  "/admin/assets/screenshots/IMG_3934.png",
  "/admin/assets/screenshots/IMG_3935.png",
  "/admin/assets/screenshots/IMG_3936.png",
  "/admin/assets/screenshots/IMG_3937.png",
];

const Landing: React.FC = () => {
  const [active, setActive] = useState(0);
  const goTo = (idx: number) => setActive((idx + screenshots.length) % screenshots.length);
  const prev = () => goTo(active - 1);
  const next = () => goTo(active + 1);
  return (
    <>
    {/* NAVBAR */}
    <nav className="navbar" id="navbar">
      <div className="container navbar-inner">
        <a href="#" className="nav-logo">
          {/* SVG LOGO */}
          <svg width="30" height="30" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="512" cy="512" r="140" fill="#3B82F6" />
            <circle cx="512" cy="512" r="100" fill="#1E40AF" />
            <line x1="512" y1="412" x2="512" y2="220" stroke="#fff" strokeWidth="12" opacity=".5" />
            <line x1="612" y1="512" x2="804" y2="512" stroke="#fff" strokeWidth="12" opacity=".5" />
            <line x1="512" y1="612" x2="512" y2="804" stroke="#fff" strokeWidth="12" opacity=".5" />
            <line x1="412" y1="512" x2="220" y2="512" stroke="#fff" strokeWidth="12" opacity=".5" />
            <line x1="598" y1="426" x2="738" y2="286" stroke="#fff" strokeWidth="10" opacity=".3" />
            <line x1="598" y1="598" x2="738" y2="738" stroke="#fff" strokeWidth="10" opacity=".3" />
            <line x1="426" y1="598" x2="286" y2="738" stroke="#fff" strokeWidth="10" opacity=".3" />
            <line x1="426" y1="426" x2="286" y2="286" stroke="#fff" strokeWidth="10" opacity=".3" />
            <circle cx="512" cy="200" r="70" fill="#FFC107" />
            <circle cx="512" cy="200" r="50" fill="#F59E0B" />
            <circle cx="824" cy="512" r="70" fill="#FFC107" />
            <circle cx="824" cy="512" r="50" fill="#F59E0B" />
            <circle cx="512" cy="824" r="70" fill="#FFC107" />
            <circle cx="512" cy="824" r="50" fill="#F59E0B" />
            <circle cx="200" cy="512" r="70" fill="#FFC107" />
            <circle cx="200" cy="512" r="50" fill="#F59E0B" />
            <circle cx="268" cy="268" r="50" fill="#3B82F6" opacity=".8" />
            <circle cx="756" cy="268" r="50" fill="#3B82F6" opacity=".8" />
            <circle cx="756" cy="756" r="50" fill="#3B82F6" opacity=".8" />
            <circle cx="268" cy="756" r="50" fill="#3B82F6" opacity=".8" />
          </svg>
          Mex
        </a>
        <ul className="nav-links">
          <li><a href="#features">Funcionalidades</a></li>
          <li><a href="#exchanges">Exchanges</a></li>
          <li><a href="#privacidade">Privacidade</a></li>
          <li><a href="#seguranca">Segurança</a></li>
          <li><a href="#download">Download</a></li>
        </ul>
        <div className="nav-right">
          {/*
          <button className="lang-btn" title="Switch language">
            <span role="img" aria-label="flag">🇺🇸</span>
            <span>EN</span>
          </button>
          */}
          <a href="#download" className="btn btn-primary btn-sm">Baixar App</a>
          <button className="nav-hamburger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>

    {/* HERO */}
    <section className="hero">
      <div className="hero-noise"></div>
      <div className="hero-gradient"></div>
      <div className="hero-grid"></div>
      <div className="container">
        <div className="hero-inner">
          <div className="hero-left" style={{alignItems:'center',textAlign:'center',margin:'0 auto',maxWidth:520}}>
            <span className="eyebrow" style={{marginBottom:12}}><span className="eyebrow-dot"></span><span>Disponível agora &middot; iOS &amp; Android</span></span>
            <h1 className="hero-title" style={{fontSize:'clamp(26px,3.5vw,38px)',fontWeight:700,color:'#2563eb',lineHeight:1.18,letterSpacing:'-0.01em',marginBottom:10}}>Gerencie todas as suas exchanges em um só lugar<br/><span className="gradient-text" style={{fontWeight:600}}>Simples, seguro e unificado.</span></h1>
            <p className="hero-sub" style={{fontSize:16.5,color:'#6b7280',margin:'0 auto 18px',maxWidth:420}}>Unifique seu portfólio de criptomoedas em múltiplas exchanges — saldos em tempo real, histórico de PnL, alertas de preço e estratégias de trading, tudo em um painel limpo e seguro.</p>
            <div className="store-btns" style={{justifyContent:'center',marginBottom:10,display:'flex',gap:16}}>
              <a href="#download" className="store-btn" style={{minWidth:160,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',padding:'10px 18px',borderRadius:12,background:'#fff',boxShadow:'0 2px 8px 0 #e0e7ef18',fontWeight:600,gap:10}}>
                {/* Google Play SVG */}
                <svg viewBox="0 0 24 24" fill="none" style={{width:28,height:28}}><path d="M3.18 1.04C2.45 1.44 2 2.22 2 3.17v17.66c0 .95.45 1.73 1.18 2.13l.1.06 9.9-9.9v-.23L3.28.98l-.1.06z" fill="#EA4335"/><path d="M16.17 16.13l-3-3v-.24l3-3 .07.04 3.55 2.02c1.01.58 1.01 1.52 0 2.1l-3.55 2.02-.07.06z" fill="#FBBC04"/><path d="M16.24 16.07L13.18 13 3.18 23c.34.35.88.4 1.49.07l11.57-6.97" fill="#34A853"/><path d="M16.24 9.93L4.67 2.96C4.06 2.63 3.52 2.68 3.18 3.03L13.18 13l3.06-3.07z" fill="#4285F4"/></svg>
                <div style={{textAlign:'left'}}><div className="store-btn-label">Disponível no</div><div className="store-btn-name">Google Play</div></div>
              </a>
              {/* App Store Button (disabled) */}
              <div style={{position:'relative',minWidth:160,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <a href="#download" className="store-btn" style={{opacity:0.5, pointerEvents:'none',minWidth:160,display:'flex',alignItems:'center',justifyContent:'center',padding:'10px 18px',borderRadius:12,background:'#fff',boxShadow:'0 2px 8px 0 #e0e7ef18',fontWeight:600,gap:10}}>
                  {/* App Store SVG */}
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:28,height:28}}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div style={{textAlign:'left'}}><div className="store-btn-label">Baixar na</div><div className="store-btn-name">App Store</div></div>
                </a>
                {/* Em breve badge no canto superior direito */}
                <div style={{position:'absolute',top:4,right:10,fontSize:10.5,color:'#e11d48',fontWeight:700,letterSpacing:'.02em',background:'#fff',padding:'1px 7px',borderRadius:8,boxShadow:'0 1px 4px #e0e7ef22'}}>Em breve</div>
              </div>
            </div>
            <div className="hero-rule" style={{margin:'18px 0 10px'}}></div>
            <div className="hero-metrics" style={{justifyContent:'center',gap:24}}>
              <div className="hm"><span className="hm-val gradient-text">11</span><span className="hm-label">Exchanges</span></div>
              <div className="hm"><span className="hm-val gradient-text">iOS &amp; Android</span><span className="hm-label">Plataformas</span></div>
              <div className="hm"><span className="hm-val gradient-text">Grátis</span><span className="hm-label">Para começar</span></div>
            </div>
          </div>
          {/* SCREENSHOTS CAROUSEL (funcional) */}
          <div className="sc-wrapper">
            <div className="sc-frame">
              <div className="sc-bezel"></div>
              <div className="sc-track">
                <div className="sc-slides" style={{transform:`translateX(-${active * 100}%)`}}>
                  {screenshots.map((src, i) => (
                    <div className="sc-slide" key={src}>
                      <img src={src} alt={`Mex app screenshot ${i+1}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sc-dots">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  className={"sc-dot" + (i === active ? " active" : "")}
                  onClick={() => goTo(i)}
                  aria-label={`Ir para screenshot ${i+1}`}
                />
              ))}
            </div>
            <div className="sc-arrows">
              <button className="sc-arr" aria-label="Anterior" onClick={prev}>&#8592;</button>
              <button className="sc-arr" aria-label="Próximo" onClick={next}>&#8594;</button>
            </div>
          </div>
        </div>
      </div>
    </section>
      {/* EXCHANGES GRID */}
      <div className="xgrid-wrap" id="exchanges">
        <div className="xgrid-title">Exchanges integradas</div>
        <div className="xgrid">
          <a href="https://www.binance.com" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/binance.png" alt="Binance" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">Binance</span>
          </a>
          <a href="https://www.bybit.com" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/bybit.png" alt="Bybit" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">Bybit</span>
          </a>
          <a href="https://www.coinbase.com" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/coinbase.png" alt="Coinbase" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">Coinbase</span>
          </a>
          <a href="https://www.okx.com" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/okx.png" alt="OKX" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">OKX</span>
          </a>
          <a href="https://www.kucoin.com" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/kucoin.png" alt="KuCoin" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">KuCoin</span>
          </a>
          <a href="https://www.mexc.com" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/mexc.png" alt="MEXC" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">MEXC</span>
          </a>
          <a href="https://www.bitget.com" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/bitget.png" alt="Bitget" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">Bitget</span>
          </a>
          <a href="https://www.gate.io" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/gateio.png" alt="Gate.io" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">Gate.io</span>
          </a>
          <a href="https://www.kraken.com" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/kraken.png" alt="Kraken" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">Kraken</span>
          </a>
          <a href="https://www.novadax.com.br" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/novadax.png" alt="Novadax" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">Novadax</span>
          </a>
          <a href="https://www.coinex.com" target="_blank" rel="noopener" className="xchip" style={{background:'none', boxShadow:'none'}}>
            <img src="/admin/assets/logos/coinex.png" alt="CoinEx" style={{width:22,height:22,borderRadius:6,objectFit:'contain'}} />
            <span className="xchip-name">CoinEx</span>
          </a>
        </div>
      </div>

      {/* STATS CLEAN GRID (temporariamente removido) */}

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="container">
          <div className="sh">
            <span className="eyebrow">Funcionalidades</span>
            <h2>Todo que você precisa<br/><span className="gradient-text">para gerir seus cripto</span></h2>
            <p>Interface nativa, rápida e construída para traders sérios. Sem complicação, sem burocracia.</p>
          </div>
          <div className="feat-grid">
            <div className="feat-card wide">
              <div className="feat-ico ico-b border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="stats-chart-outline" size="large" style={{fontSize:22}}></ion-icon></div>
              <div className="feat-title">Portfólio Unificado</div>
              <div className="feat-desc">Visualize o saldo total consolidado de todas as suas exchanges em um único painel. Acompanhe a evolução patrimonial com gráficos interativos, veja o PnL do dia e converta valores automaticamente entre USD e BRL.</div>
              <div className="feat-tags"><span className="tag">Gráfico histórico</span><span className="tag">USD / BRL</span><span className="tag">PnL 24h</span><span className="tag">Multi-exchange</span></div>
            </div>
            <div className="feat-card">
              <div className="feat-ico ico-a border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="notifications-outline" size="large" style={{fontSize:22}}></ion-icon></div>
              <div className="feat-title">Alertas de Preço</div>
              <div className="feat-desc">Crie alertas para qualquer ativo e receba notificação imediata quando o preço-alvo for atingido.</div>
              <div className="feat-tags"><span className="tag">Acima / Abaixo</span><span className="tag">Multi-exchange</span></div>
            </div>
            <div className="feat-card">
              <div className="feat-ico ico-p border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="trending-up-outline" size="large" style={{fontSize:22}}></ion-icon></div>
              <div className="feat-title">Estratégias</div>
              <div className="feat-desc">Templates prontos para DCA, Scalping e Swing Trade com simulador integrado para analisar antes de executar.</div>
              <div className="feat-tags"><span className="tag">DCA</span><span className="tag">Simulador</span></div>
            </div>
            <div className="feat-card">
              <div className="feat-ico ico-g border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="list-outline" size="large" style={{fontSize:22}}></ion-icon></div>
              <div className="feat-title">Ordens Abertas</div>
              <div className="feat-desc">Todas as ordens abertas de todas as exchanges em um só lugar, com atualização automática.</div>
              <div className="feat-tags"><span className="tag">Sincronização</span><span className="tag">Cancelamento</span></div>
            </div>
            <div className="feat-card">
              <div className="feat-ico ico-r border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="lock-closed-outline" size="large" style={{fontSize:22}}></ion-icon></div>
              <div className="feat-title">Login Biométrico</div>
              <div className="feat-desc">Face ID, Touch ID, Google e Apple Sign In. Acesso rápido e seguro sem digitar senha toda vez.</div>
              <div className="feat-tags"><span className="tag">Face ID</span><span className="tag">Touch ID</span></div>
            </div>
            <div className="feat-card">
              <div className="feat-ico ico-c border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="eye-off-outline" size="large" style={{fontSize:22}}></ion-icon></div>
              <div className="feat-title">Modo Privacidade</div>
              <div className="feat-desc">Oculte todos os valores financeiros com um toque — ideal para locais públicos.</div>
              <div className="feat-tags"><span className="tag">Dark / Light</span><span className="tag">Ocultar valores</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACIDADE */}
      <section className="section" id="privacidade" style={{background:"rgba(255,255,255,.013)"}}>
        <div className="container">
          <div className="split">
            <div className="split-info">
              <span className="eyebrow">Privacidade</span>
              <h2 className="split-title">O que o Mex<br/><span className="gradient-text">armazena sobre você</span></h2>
              <p className="split-text">Transparência total. Salvamos apenas o essencial para o app funcionar. Nenhum dado financeiro sensível é compartilhado com terceiros.</p>
              <p className="split-text">Todos os seus dados pertencem a você. Exclua sua conta a qualquer momento em <strong>Configurações → Conta → Excluir conta</strong>.</p>
            </div>
            <div className="data-cards">
              <div className="data-card">
                <div className="data-card-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="person-outline" size="large" style={{fontSize:22}}></ion-icon></div>
                <div>
                  <div className="data-card-title">Dados de cadastro</div>
                  <div className="data-card-desc">Nome, e-mail e foto de perfil (opcional). Usados apenas para identificação no app.</div>
                </div>
              </div>
              <div className="data-card">
                <div className="data-card-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="key-outline" size="large" style={{fontSize:22}}></ion-icon></div>
                <div>
                  <div className="data-card-title">Chaves de API das exchanges</div>
                  <div className="data-card-desc">Armazenadas de forma segura no dispositivo. Utilizadas somente para consultar saldos e ordens, nunca compartilhadas com terceiros.</div>
                </div>
              </div>
              <div className="data-card">
                <div className="data-card-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="camera-outline" size="large" style={{fontSize:22}}></ion-icon></div>
                <div>
                  <div className="data-card-title">Histórico de portfólio</div>
                  <div className="data-card-desc">Registros do saldo total ao longo do tempo para calcular o PnL histórico. Vinculados exclusivamente à sua conta.</div>
                </div>
              </div>
              <div className="data-card">
                <div className="data-card-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="notifications-outline" size="large" style={{fontSize:22}}></ion-icon></div>
                <div>
                  <div className="data-card-title">Estratégias e alertas</div>
                  <div className="data-card-desc">Suas configurações salvas para sincronização entre dispositivos.</div>
                </div>
              </div>
              <div className="data-card no-save">
                <div className="data-card-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="close-circle-outline" size="large" style={{fontSize:22}}></ion-icon></div>
                <div>
                  <div className="data-card-title">O que o Mex não armazena</div>
                  <div className="data-card-desc">Senhas das exchanges, dados biométricos, histórico de transações. Nenhuma informação é vendida ou usada para publicidade.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className="section" id="seguranca">
        <div className="container">
          <div className="sh">
            <span className="eyebrow">Segurança</span>
            <h2>Seus ativos protegidos<br/><span className="gradient-text">em cada camada</span></h2>
            <p>Segurança pensada desde o início — seus dados nunca transitam sem proteção.</p>
          </div>
          <div className="sec-grid">
            <div className="sec-card"><div className="sec-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="lock-closed-outline" size="large" style={{fontSize:22}}></ion-icon></div><div className="sec-title">Armazenamento seguro</div><div className="sec-text">Credenciais armazenadas com criptografia nativa do sistema operacional. Nunca expostas em texto simples.</div></div>
            <div className="sec-card"><div className="sec-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="finger-print-outline" size="large" style={{fontSize:22}}></ion-icon></div><div className="sec-title">Autenticação Biométrica</div><div className="sec-text">Face ID e Touch ID para acesso rápido e seguro. Bloqueio automático por inatividade configurável.</div></div>
            <div className="sec-card"><div className="sec-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="shield-checkmark-outline" size="large" style={{fontSize:22}}></ion-icon></div><div className="sec-title">Login seguro</div><div className="sec-text">Google e Apple Sign In com padrão OAuth 2.0. Sessões autenticadas com tokens de curta duração.</div></div>
            <div className="sec-card"><div className="sec-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="document-text-outline" size="large" style={{fontSize:22}}></ion-icon></div><div className="sec-title">Somente leitura</div><div className="sec-text">Integrações com exchanges operam por padrão com permissão de leitura. Nenhuma ordem é executada sem ação explícita do usuário.</div></div>
            <div className="sec-card"><div className="sec-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="flash-outline" size="large" style={{fontSize:22}}></ion-icon></div><div className="sec-title">Comunicação segura</div><div className="sec-text">Toda comunicação entre o app e o servidor ocorre via HTTPS. Backend construído com foco em performance e segurança.</div></div>
            <div className="sec-card"><div className="sec-ico border-2 border-blue-500 bg-transparent rounded-full p-1"><ion-icon name="trash-outline" size="large" style={{fontSize:22}}></ion-icon></div><div className="sec-title">Exclusão total</div><div className="sec-text">Delete sua conta e todos os dados associados a qualquer momento pelo app, sem burocracia.</div></div>
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section className="dl-section" id="download">
        <div className="container">
          <div className="sh">
            <span className="eyebrow">Download</span>
            <h2>Baixe agora.<br/><span className="gradient-text">Grátis para começar.</span></h2>
            <p>Disponível na App Store e Google Play. Escaneie o QR code ou toque no botão para instalar direto no celular.</p>
          </div>
          <div className="dl-grid">
            <div className="dl-card">
              <div className="dl-platform">Android</div>
              <div className="dl-name">Google Play</div>
              <div className="qr-box"><span className="qr-label">Google Play</span></div>
              <a href="https://play.google.com/store/apps/details?id=com.cryptohub.mobile" target="_blank" className="dl-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.18 1.04C2.45 1.44 2 2.22 2 3.17v17.66c0 .95.45 1.73 1.18 2.13l.1.06 9.9-9.9v-.23L3.28.98l-.1.06z" fill="#EA4335"/><path d="M16.17 16.13l-3-3v-.24l3-3 .07.04 3.55 2.02c1.01.58 1.01 1.52 0 2.1l-3.55 2.02-.07.06z" fill="#FBBC04"/><path d="M16.24 16.07L13.18 13 3.18 23c.34.35.88.4 1.49.07l11.57-6.97" fill="#34A853"/><path d="M16.24 9.93L4.67 2.96C4.06 2.63 3.52 2.68 3.18 3.03L13.18 13l3.06-3.07z" fill="#4285F4"/></svg>
                <span>Baixar no Google Play</span>
              </a>
              <div className="soon">⚡ <span>Em breve nas lojas</span></div>
            </div>
            <div className="dl-card" style={{opacity:0.5, pointerEvents:'none'}}>
              <div className="dl-platform">iPhone / iPad</div>
              <div className="dl-name">App Store</div>
              <div className="qr-box"><span className="qr-label">App Store</span></div>
              <button className="dl-btn" disabled style={{opacity:0.7, cursor:'not-allowed'}}>Baixar na App Store</button>
              <div style={{fontSize:11,color:'#e11d48',marginTop:6,fontWeight:600,letterSpacing:'.02em'}}>Em breve</div>
            </div>
          </div>
          {/* PLANOS */}
          <div style={{marginTop:72}}>
            <div style={{textAlign:"center",fontSize:10,fontWeight:700,color:"var(--text-3)",letterSpacing:".14em",textTransform:"uppercase",marginBottom:32}}>Planos</div>
            <div className="plans-grid">
              {/* FREE */}
              <div className="plan-card">
                <div className="plan-name" style={{color:"var(--text-3)"}}>Free</div>
                <div className="plan-price" style={{color:"var(--text)"}}>R$ 0</div>
                <div className="plan-period">para sempre</div>
                <div className="plan-sub">Comece sem custo</div>
                <div className="plan-divider"></div>
                <ul className="plan-list">
                  <li><span className="plan-check-ico">✓</span>2 exchanges conectadas</li>
                  <li><span className="plan-check-ico">✓</span>Watchlist com 3 tokens</li>
                  <li><span className="plan-check-ico">✓</span>5 alertas de preço</li>
                  <li><span className="plan-check-ico">✓</span>Portfólio básico</li>
                  <li><span className="plan-x-ico">—</span><span style={{color:"var(--text-3)"}}>Banners de anúncio</span></li>
                  <li><span className="plan-x-ico">—</span><span style={{color:"var(--text-3)"}}>Estratégias de trading</span></li>
                  <li><span className="plan-x-ico">—</span><span style={{color:"var(--text-3)"}}>Analytics avançado</span></li>
                </ul>
              </div>
              {/* PRO */}
              <div className="plan-card pro">
                <div className="plan-badge b-pro">POPULAR</div>
                <div className="plan-name gradient-text">Pro</div>
                <div className="plan-price" style={{color:"var(--blue-light)"}}>R$ 9,90</div>
                <div className="plan-period">/mês</div>
                <div className="plan-sub">Para traders ativos</div>
                <div className="plan-divider"></div>
                <ul className="plan-list">
                  <li><span className="plan-check-ico">✓</span>Exchanges ilimitadas</li>
                  <li><span className="plan-check-ico">✓</span>Watchlist ilimitada</li>
                  <li><span className="plan-check-ico">✓</span>Alertas ilimitados</li>
                  <li><span className="plan-check-ico">✓</span>Portfólio completo</li>
                  <li><span className="plan-check-ico">✓</span>Sem anúncios</li>
                  <li><span className="plan-check-ico">✓</span>Estratégias de trading</li>
                  <li><span className="plan-check-ico">✓</span>Analytics avançado</li>
                  <li><span className="plan-x-ico">—</span><span style={{color:"var(--text-3)"}}>Suporte prioritário</span></li>
                </ul>
              </div>
              {/* PREMIUM */}
              <div className="plan-card premium">
                <div className="plan-badge b-premium">COMPLETO</div>
                <div className="plan-name" style={{color:"var(--purple)"}}>Premium</div>
                <div className="plan-price" style={{color:"#a78bfa"}}>R$ 29,90</div>
                <div className="plan-period">/mês</div>
                <div className="plan-sub">Tudo + recursos exclusivos</div>
                <div className="plan-divider"></div>
                <ul className="plan-list">
                  <li><span className="plan-check-ico">✓</span>Exchanges ilimitadas</li>
                  <li><span className="plan-check-ico">✓</span>Watchlist ilimitada</li>
                  <li><span className="plan-check-ico">✓</span>Alertas ilimitados</li>
                  <li><span className="plan-check-ico">✓</span>Portfólio completo</li>
                  <li><span className="plan-check-ico">✓</span>Sem anúncios</li>
                  <li><span className="plan-check-ico">✓</span>Estratégias de trading</li>
                  <li><span className="plan-check-ico">✓</span>Analytics avançado</li>
                  <li><span className="plan-check-ico">✓</span>Suporte prioritário 24/7</li>
                </ul>
              </div>
            </div>
            <p style={{textAlign:"center",fontSize:11.5,color:"var(--text-3)",marginTop:20}}>As assinaturas são renovadas automaticamente. Cancele a qualquer momento. Os preços podem variar por região.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-wrap">
            <div className="cta-inner">
              <span className="eyebrow"><ion-icon name="lock-closed-outline" style={{fontSize:14,marginRight:6,verticalAlign:'middle'}}></ion-icon>Projeto Proprietário</span>
              <h2 className="cta-title" style={{textAlign:'center',fontSize:'clamp(22px,2.5vw,32px)',fontWeight:800,marginBottom:10}}>Pronto para unificar<br/><span className="gradient-text">suas exchanges?</span></h2>
              <p className="cta-sub" style={{textAlign:'center',fontSize:15.5,color:'#6b7280',margin:'0 auto 18px',maxWidth:420}}>Baixe o Mex gratuitamente e gerencie todo o seu portfólio cripto num único lugar — com segurança e praticidade.</p>
              <div className="cta-btns">
                <a href="#download" className="btn btn-primary btn-lg"><ion-icon name="download-outline" style={{fontSize:18,marginRight:7,verticalAlign:'middle'}}></ion-icon>Baixar agora</a>
                <a href="mailto:contato@mex.app.br" className="btn btn-ghost btn-lg"><ion-icon name="mail-outline" style={{fontSize:18,marginRight:7,verticalAlign:'middle'}}></ion-icon>Falar com a equipe</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div style={{display:"flex",alignItems:"center",gap:9,fontSize:16,fontWeight:800,letterSpacing:"-.4px"}}>
                <svg width="26" height="26" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="512" cy="512" r="140" fill="#3B82F6"/>
                  <circle cx="512" cy="512" r="100" fill="#1E40AF"/>
                  <line x1="512" y1="412" x2="512" y2="220" stroke="#fff" strokeWidth="12" opacity=".5"/>
                  <line x1="612" y1="512" x2="804" y2="512" stroke="#fff" strokeWidth="12" opacity=".5"/>
                  <line x1="512" y1="612" x2="512" y2="804" stroke="#fff" strokeWidth="12" opacity=".5"/>
                  <line x1="412" y1="512" x2="220" y2="512" stroke="#fff" strokeWidth="12" opacity=".5"/>
                  <line x1="598" y1="426" x2="738" y2="286" stroke="#fff" strokeWidth="10" opacity=".3"/>
                  <line x1="598" y1="598" x2="738" y2="738" stroke="#fff" strokeWidth="10" opacity=".3"/>
                  <line x1="426" y1="598" x2="286" y2="738" stroke="#fff" strokeWidth="10" opacity=".3"/>
                  <line x1="426" y1="426" x2="286" y2="286" stroke="#fff" strokeWidth="10" opacity=".3"/>
                  <circle cx="512" cy="200" r="70" fill="#FFC107"/>
                  <circle cx="512" cy="200" r="50" fill="#F59E0B"/>
                  <circle cx="824" cy="512" r="70" fill="#FFC107"/>
                  <circle cx="824" cy="512" r="50" fill="#F59E0B"/>
                  <circle cx="512" cy="824" r="70" fill="#FFC107"/>
                  <circle cx="512" cy="824" r="50" fill="#F59E0B"/>
                  <circle cx="200" cy="512" r="70" fill="#FFC107"/>
                  <circle cx="200" cy="512" r="50" fill="#F59E0B"/>
                  <circle cx="268" cy="268" r="50" fill="#3B82F6" opacity=".8"/>
                  <circle cx="756" cy="268" r="50" fill="#3B82F6" opacity=".8"/>
                  <circle cx="756" cy="756" r="50" fill="#3B82F6" opacity=".8"/>
                  <circle cx="268" cy="756" r="50" fill="#3B82F6" opacity=".8"/>
                </svg>
                Mex
              </div>
              <p className="footer-brand-desc">Plataforma mobile para gestão unificada de portfólios de criptomoedas. Desenvolvido no Brasil. 🇧🇷</p>
            </div>
            <div>
              <div className="footer-col-title">Produto</div>
              <ul className="footer-links">
                <li><a href="#features">Funcionalidades</a></li>
                <li><a href="#privacidade">Privacidade</a></li>
                <li><a href="#seguranca">Segurança</a></li>
                <li><a href="#download">Download</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Legal</div>
              <ul className="footer-links">
                <li><a href="#">Política de Privacidade</a></li>
                <li><a href="#">Termos de Uso</a></li>
                <li><a href="#">Excluir Conta</a></li>
                <li><a href="mailto:contato@mex.app.br">Contato</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Exchanges</div>
              <ul className="footer-links">
                <li><a href="https://www.binance.com" target="_blank" rel="noopener">Binance</a></li>
                <li><a href="https://www.bybit.com" target="_blank" rel="noopener">Bybit</a></li>
                <li><a href="https://www.okx.com" target="_blank" rel="noopener">OKX</a></li>
                <li><a href="https://www.kucoin.com" target="_blank" rel="noopener">KuCoin</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2026 Mex &middot; Todos os direitos reservados</span>
            <span className="footer-prop">🔒 Projeto Proprietário</span>
            <span className="footer-copy">Desenvolvido por <a href="https://github.com/CharlesSampaio-CRS" target="_blank" rel="noopener" style={{color:"var(--blue-light)",fontWeight:600}}>Charles Roberto Sampaio</a></span>
          </div>
        </div>
      </footer>
  </>
  );
};

export default Landing;
