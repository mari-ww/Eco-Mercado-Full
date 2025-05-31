const amqp = require('amqplib');

async function publicarPagamento(pagamento) {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'pagamentos';

        await channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(pagamento)));

        console.log('Mensagem de pagamento enviada:', pagamento);

        await channel.close();
        await connection.close();

        return { message: 'Pagamento enviado para processamento!' }; // Retorno de sucesso
    } catch (error) {
        console.error('Erro ao publicar pagamento:', error);
        throw error; // Propaga o erro para o server.js
    }
}

module.exports = { publicarPagamento };
