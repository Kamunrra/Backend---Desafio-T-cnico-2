O objetivo aqui é criar uma API RESTful utilizando JavaScript e SQL para autenticação de usuários, que permita operações de cadastro (sign up), autenticação (sign in) e recuperação de informações do usuário.
Com as sequintes especificações técnicas:

●     Todos os endpoints devem aceitar e retornar apenas dados no formato JSON.

●     Retorno JSON para situações de endpoint não encontrado.

●     Armazenamento persistente de dados do usuário.

●     Formato padrão de mensagens/erro: { "mensagem": "mensagem de erro" };

○     E-mail já cadastrado:         { "mensagem": "E-mail já existente" }  

○     E-mail não cadastrado ou senha incorreta: { "mensagem": "Usuário e/ou senha inválidos" }  

○     Senha incorreta: status 401 com: { "mensagem": "Usuário e/ou senha inválidos" }  

○     Token inválido: { "mensagem": "Não autorizado" }

○     Token expirado (mais de 30 minutos): { "mensagem": "Sessão inválida" }.

Requisitos:

●     Persistência de dados.

●     Sistema de build com gerenciamento de dependências.

●     Task runner para build.

●     Padronização de estilo (ex: jsHint/jsLint).

●     Framework: Express, Hapi, ou similar.

●     JWT como token.

●     Testes unitários.

●     Criptografia hash na senha e token.

●     Hospedagem: Heroku, Google Cloud, AWS, ou similar.

//SEGUE O LINK DA COLEÇÃO DO POSTMAN/COM CONEXÃO AO APP NO HEROKU//
https://www.postman.com/universal-moon-551340/workspace/backend-challenge/collection/31370666-321111ee-56ed-40f8-8b94-8de508668898?action=share&creator=31370666

