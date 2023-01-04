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

//função para pegar o valor de crédito em conta 
function getBalance(statement){
    //reduce acumula valores passados em uma operação em acc
    const balance = statement.reduce((acc, operation)=>{
        if(operation.type === 'credit'){
            //retorna a soma do valor adicionado no credito e soma com o valor em amouth
            return acc + operation.amouth;

        }else{
            //caso contrário (débito), subtrai o valor em acc de amouth
            return acc - operation.amouth;
        }
    }, 0); //valor inicial do reduce (0)

    return balance;    
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
// usa quando quer este middleware passe por todas as rotas abaixo:
//app.use(verifyIfExistsAccountCPF);

app.get("/statement/", verifyIfExistsAccountCPF, (request, response)=>{
    const {customer} = request;//peganho o customer do verifyIfExistsAccountCPF
    return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response)=>{
    const {description, amouth} = request.body;

    const {customer} = request; // array recupera o customer

    const statementOperation = {
        description,
        amouth,
        created_at: new Date(),
        type: "credit"
    };

    //joga as informações do statementOperation dentro do customer>statement
    customer.statement.push(statementOperation);
    return response.status(201).send();

});

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response)=>{
    const {amouth} = request.body;
    const {customer} = request; // array recupera o customer

    const balance = getBalance(customer.statement);  
    
    //verificação se o valor de saque é maior que o varlor armazenado (amouth)
    if(balance < amouth){
        return response.status(400).json({error: "insufficient funds"})

    }

    const statementOperation = {
        amouth,
        created_at: new Date(),
        type: "debit"
    };

    //joga as informações do statementOperation dentro do customer>statement
    customer.statement.push(statementOperation);
    return response.status(201).send();

});

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response)=>{
    const {customer} = request;//peganho o customer do verifyIfExistsAccountCPF
    const {date} = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter(
    (statement)=>
    statement.created_at.toDateString() === 
    new Date(dateFormat).toDateString());

    return response.json(statement);
});

app.listen(3333);