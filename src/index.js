const { request, response } = require("express");
const express = require("express");
const {v4: uuidv4} = require("uuid");//v4 gera id randômica

const app = express();

app.use(express.json());//para receber um json

const customers = [];

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

app.get("/statement/:cpf", (request, response)=>{
    const {cpf} = request.params;
    
    //find retorna o objeto completo. retorna e verifica se o cpf existe
    const customer = customers.find((customer)=>customer.cpf === cpf);

    if(!customer){
        return response.status(400).json({error: "Costumer not found"});
    }

    return response.json(customer.statement);
    
});

app.listen(3333);