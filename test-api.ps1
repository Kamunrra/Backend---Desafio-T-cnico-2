# Script para testar os endpoints da sua API

# Função para realizar uma solicitação HTTP GET
function TestGetRequest($url, $token) {
    $headers = @{
        Authorization = "Bearer $token"
    }

    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
        Write-Output $response
    } catch {
        Write-Error $_.Exception.Message
    }
}

# Função para realizar uma solicitação HTTP POST
function TestPostRequest($url, $body) {
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
        Write-Output $response
    } catch {
        Write-Error $_.Exception.Message
    }
}

# URL da sua API
$apiUrl = "http://localhost:3000"

# Testar o endpoint de cadastro (POST)
$bodyCadastro = @{
    nome = "Giovanne Barbosa"
    email = "kamunrra1@outlook.com"
    senha = "123456789"
    telefones = [{ "123456789", "19" }]
} | ConvertTo-Json

TestPostRequest "$apiUrl/signup" $bodyCadastro

# Testar o endpoint de autenticação (POST)
$bodyAutenticacao = @{
    email = "kamunrra1@outlook.com"
    senha = "159159159"
} | ConvertTo-Json

$autenticacaoResponse = TestPostRequest "$apiUrl/signin" $bodyAutenticacao

# Extrair o token do resultado de autenticação
$token = $autenticacaoResponse.token

# Testar o endpoint de busca de usuário (GET) com token válido
TestGetRequest "$apiUrl/user" $token

# Aguardar 31 minutos para que o token expire
Start-Sleep -Seconds (31 * 60)

# Testar o endpoint de busca de usuário (GET) com token expirado
TestGetRequest "$apiUrl/user" $token
