Add-Type -AssemblyName System.Speech

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Selecionar uma voz em português, se disponível
$vozes = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture -match "pt-BR" }
if ($vozes.Count -gt 0) {
    $synth.SelectVoice($vozes[0].VoiceInfo.Name)
}

$textos = @(
    "Olá a todos! Meu nome é Roberto e este é o TxPredict, a nossa submissão para a Trilha 1 do Hackathon da Copa do Mundo TxODDS. O maior problema das plataformas de apostas descentralizadas hoje é a dependência de oráculos de terceiros e a intervenção manual. O TxPredict resolve isso criando mercados P2P trustless que se liquidam sozinhos usando as Merkle Proofs do feed criptográfico on-chain da TxODDS na Solana.",
    
    "Nossa interface foi construída para a melhor experiência do usuário. O usuário visualiza os mercados da Copa do Mundo e os Pools de liquidez. Ao apostar, o dinheiro vai direto para o cofre do Smart Contract na Solana. Não temos custódia.",
    
    "A mágica acontece no Smart Contract feito em Anchor. Em vez de termos um administrador declarando o vencedor, qualquer pessoa pode chamar a instrução resolve_market. Ela executa uma chamada diretamente para o oráculo da TxODDS. Se a prova for válida, o mercado encerra e o dinheiro é liberado. É matemática no lugar de confiança.",
    
    "Para garantir que o usuário não precise enviar a prova manualmente, criamos um Keeper em Node.js. Ele escuta a stream de eventos da TxLINE. Assim que detecta a finalização de uma partida, ele puxa o payload da API e imediatamente injeta a prova no nosso Smart Contract. Vejam a simulação rodando no terminal, assinando o settlement sem falhas.",
    
    "Com o TxPredict, nós conectamos a velocidade absurda da Solana, a pureza dos dados esportivos da TxLINE e os contratos inteligentes para criar a próxima geração de mercados P2P para a Copa de 2026. O código é aberto e o repositório está na descrição. Muito obrigado à TxODDS e ao Superteam Brasil!"
)

for ($i = 0; $i -lt $textos.Count; $i++) {
    $num = $i + 1
    $filename = "c:\Users\rober\OneDrive\Documentos\copadomundo\audio_parte_$num.wav"
    Write-Host "Gerando $filename..."
    $synth.SetOutputToWaveFile($filename)
    $synth.Speak($textos[$i])
}

$synth.Dispose()
Write-Host "Todos os áudios foram gerados com sucesso!"
