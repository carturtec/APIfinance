const { request, response } = require("express");
const express = require("express");
const {v4: uuidv4} = require("uuid");//v4 gera id randômica

const app = express();

app.use(express.json());//para receber um json

const customers = [];

//Middleware
function verifyIfExistsAccountCPF(request, response, next){
    const {cpf} = request.headers;
    
    //find retorna o objeto completo. retorna e verifica se o cpf existe
    const customer = customers.find((customer)=>customer.cpf === cpf);

    if(!customer){
        return response.status(400).json({error: "Costumer not found"});
    }
    //passando custumer para todas as rotas que requisitarem o verifyIfExistsAccountCPF
    request.customer = customer;

    return next();

}

/*requisitos e tipos:
  cpf - string
  name - string
  id - uuid
  statement[]
*/

app.post("/account", (request, response)=>{
    const {cpf, name} = request.body;

    //compara se o tipo e o valor são iguais (cpf) some retorna um boolean 
    const customerExists = customers.some(
        (customer)=> customer.cpf === cpf);

    //validação - verifica se o cpf já existe se não, continua...
    if(customerExists){
        return response.status(400).json({error: "Customer Exists!"})
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send();
});

//passando Middleware na rota
// usa quando quer este middleware passe por todas as rotas abaixo
//app.use(verifyIfExistsAccountCPF);

app.get("/statement/", verifyIfExistsAccountCPF, (request, response)=>{
    const {customer} = request;//peganho o customer do verifyIfExistsAccountCPF
    return response.json(customer.statement);
});

app.listen(3333);