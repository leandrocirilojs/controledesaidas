document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expenses');
    const totalAmount = document.getElementById('total-amount');
    const totalProfit = document.getElementById('total-profit');
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const filterDriver = document.getElementById('filter-driver');
    const filterStore = document.getElementById('filter-store'); // Novo filtro
    const downloadPdfButton = document.getElementById('download-pdf');

    let filteredExpenses = [];  // Armazena as saídas filtradas para o PDF

    // Função para carregar e filtrar saídas
    const loadExpenses = (filterStartDateValue = null, filterEndDateValue = null, filterDriverValue = null, filterStoreValue = null) => {
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenseList.innerHTML = '';  // Limpa a lista de saídas
        let total = 0;
        let totalProf = 0;

        filteredExpenses = [];  // Reinicia a lista filtrada

        // Itera sobre cada saída no LocalStorage
        expenses.forEach((expense, index) => {
            const dateExpense = new Date(expense.date);  // Converte a data da saída para o formato Date

            const startDateMatch = !filterStartDateValue || dateExpense >= new Date(filterStartDateValue);
            const endDateMatch = !filterEndDateValue || dateExpense <= new Date(filterEndDateValue);
            const driverMatch = !filterDriverValue || expense.driver === filterDriverValue;
            const storeMatch = !filterStoreValue || expense.store === filterStoreValue; // Verifica loja

            // Verifica se a saída corresponde aos filtros
            if (startDateMatch && endDateMatch && driverMatch && storeMatch) {
                const li = document.createElement('li');
                li.innerHTML = `
    <div style="width: 300px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); padding: 20px; position: relative; font-family: Arial, sans-serif;">
        <button onclick="removeExpense(${index})" style="position: absolute; top: 15px; right: 15px; color: red; font-weight: bold; border: none; background: none; font-size: 20px; cursor: pointer;">&times;</button>
        <div>
            <h2 style="margin: 0; text-align: left; font-size: 1.5em; color: #333;">${expense.driver}</h2>
            <p style="margin: 5px 0; color: #666;">${expense.store}</p>
        </div>
        
        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <td style="padding: 8px; vertical-align: top;">
                    <p style="font-size: 0.9em; color: #666;">Valor Pago</p>
                    <p style="font-size: 1.2em; font-weight: bold; color: #333;">R$${expense.amount}</p>
                </td>
                <td style="padding: 8px; vertical-align: top;">
                    <p style="font-size: 0.9em; color: #666;">Recebido</p>
                    <p style="font-size: 1.2em; font-weight: bold; color: #333;">R$${expense.received}</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px; vertical-align: top;">
                    <p style="font-size: 0.9em; color: #666;">Lucro</p>
                    <p style="font-size: 1.2em; font-weight: bold; color: green;">R$${expense.profit}</p>
                </td>
                <td style="padding: 8px; vertical-align: top;">
                    <p style="font-size: 0.9em; color: #666;">Data</p>
                    <p style="font-size: 1.2em; font-weight: bold; color: #333;">${expense.date}</p>
                </td>
            </tr>
        </table>
    </div>`;
                expenseList.appendChild(li);
                total += parseFloat(expense.amount);
                totalProf += parseFloat(expense.profit);

                filteredExpenses.push(expense);  // Armazena a saída filtrada
            }
        });

        // Atualiza os totais
        totalAmount.textContent = total.toFixed(2);
        totalProfit.textContent = totalProf.toFixed(2);
    };

    // Adicionar nova saída
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const driver = document.getElementById('driver-name').value;
        const store = document.getElementById('store-name').value;
        const amount = document.getElementById('expense-amount').value;
        const received = document.getElementById('received-amount').value;
        const date = document.getElementById('expense-date').value;
        const profit = (received - amount).toFixed(2);

        const expense = { driver, store, amount, received, profit, date };
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));

        //loadExpenses();  // Carrega a lista após adicionar uma nova saída
        if(filterStartDate && filterEndDate) {
    const today = new Date().toISOString().split('T')[0];
    filterStartDate.value = today;
    filterEndDate.value = today;
    applyFilters();
}

        // limpar todos os campos ^ expenseForm.reset();
    });

    // Remover saída
    window.removeExpense = (index) => {
        const password = prompt("2702..Digite a senha para confirmar a remoção:");
        const correctPassword = ""; // Defina sua senha aqui

        if (password === correctPassword) {
            const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
            expenses.splice(index, 1);  // Remove a saída da lista
            localStorage.setItem('expenses', JSON.stringify(expenses));  // Atualiza o LocalStorage
            //loadExpenses();
            if(filterStartDate && filterEndDate) {
    const today = new Date().toISOString().split('T')[0];
    filterStartDate.value = today;
    filterEndDate.value = today;
    applyFilters();
}

            
            // Recarrega a lista após a remoção
        } else {
            alert("Senha incorreta! A saída não foi removida.");
        }
    };

    // Função para aplicar os filtros de data, motorista e loja
    const applyFilters = () => {
        const startDate = filterStartDate.value;
        const endDate = filterEndDate.value;
        const driver = filterDriver.value;
        const store = filterStore.value; // Obtemos o valor do filtro de loja
        loadExpenses(startDate, endDate, driver, store);  // Aplica os filtros
    };

    // Eventos dos filtros de data, motorista e loja
    filterStartDate.addEventListener('change', applyFilters);
    filterEndDate.addEventListener('change', applyFilters);
    filterDriver.addEventListener('change', applyFilters);
    filterStore.addEventListener('change', applyFilters); // Adiciona o evento para o filtro de loja

    // Função para gerar o PDF
    downloadPdfButton.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurações iniciais
    const pageHeight = doc.internal.pageSize.getHeight(); // Altura da página
    const margin = 14; // Margem
    let y = margin; // Posição vertical inicial
    const lineHeight = 10; // Altura de cada linha
    const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight); // Máximo de linhas por página

    // Função para adicionar uma nova página
    const addNewPage = () => {
        doc.addPage();
        y = margin; // Reinicia a posição Y para o topo da nova página
    };

    // Cabeçalho do PDF
    doc.setFontSize(18);

    doc.text('Fechamento Tenda', margin, y);
    y += lineHeight * 2; // Espaço após o cabeçalho

    // Adiciona o intervalo de datas do filtro
    const startDate = filterStartDate.value || 'Não especificada';
    const endDate = filterEndDate.value || 'Não especificada';
    doc.setFontSize(14);
    doc.text(`Período: ${startDate} a ${endDate}`, margin, y);
    y += lineHeight * 2; // Espaço após o período

    // Adiciona o título das colunas
    doc.setFontSize(12);
    doc.text('Motorista - Loja - Valor - Data', margin, y);
    y += lineHeight; // Espaço após o título

    // Adiciona cada saída filtrada
    let totalValue = 0; // Para somar os valores das saídas

    filteredExpenses.forEach((expense, index) => {
        // Verifica se é necessário adicionar uma nova página
        if (y + lineHeight > pageHeight - margin) {
            addNewPage();
        }

        const expenseText = `${expense.driver} - ${expense.store} - R$ ${expense.received} - ${expense.date}`;
        doc.text(expenseText, margin, y);
        y += lineHeight; // Move para a próxima linha
        totalValue += parseFloat(expense.received); // Acumula o valor total
    });

    // Adiciona o total e a quantidade de saídas ao PDF
    if (y + lineHeight * 3 > pageHeight - margin) {
        addNewPage();
    }
    doc.setFontSize(14);
    y += lineHeight; // Espaço antes do texto final
    doc.text(`Quantidade de Saídas: ${filteredExpenses.length}`, margin, y);
    y += lineHeight;
    doc.text(`Valor Total: R$${totalValue.toFixed(2)}`, margin, y);

    // Salva o PDF
    doc.save('Relatorio_de_Saidas.pdf');
});

//whats
const generateWhatsAppMessage = () => {
    const startDate = document.getElementById('filter-start-date').value || 'Não especificada';
    const endDate = document.getElementById('filter-end-date').value || 'Não especificada';
    const driver = document.getElementById('filter-driver').value || 'Não especificado';
    const store = document.getElementById('filter-store').value || 'Não especificada';

    // Recalcula o valor total das saídas filtradas
    let totalValue = 0;
    filteredExpenses.forEach(expense => {
        totalValue += parseFloat(expense.received);
    });

    // Agrupa as saídas por data
    const groupedExpenses = {};
    filteredExpenses.forEach(expense => {
        const date = expense.date;
        if (!groupedExpenses[date]) {
            groupedExpenses[date] = 0;
        }
        groupedExpenses[date]++;
    });

    // Cria a mensagem
    let message = `*Fechamento Tenda*\n\n`;
    message += `*${store}*\n\n`;
    message += `*${driver}*\n\n`;
    message += `*_${startDate} a ${endDate}_*\n\n`;

    // Adiciona as saídas por dia
    for (const [date, count] of Object.entries(groupedExpenses)) {
        message += `${date} - ${count} Saída${count > 1 ? 's' : ''}\n`;
    }

    // Adiciona totais
    message += `\n*Total de Saídas:* ${filteredExpenses.length} saída${filteredExpenses.length > 1 ? 's' : ''}\n`;
    message += `*Valor total:* R$ ${totalValue.toFixed(2)}\n`;

    return message;
};

// Enviar via WhatsApp
document.getElementById('send-whatsapp').addEventListener('click', () => {
    // Verifica se há saídas filtradas
    if (filteredExpenses.length === 0) {
        alert("Nenhuma saída filtrada para enviar.");
        return;
    }

    // Gera a mensagem
    const message = generateWhatsAppMessage();

    // Cria a URL do WhatsApp
    const phoneNumber = "5513981335733"; // Substitua pelo número de telefone desejado
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Abre o WhatsApp em uma nova aba
    window.open(whatsappUrl, '_blank');
});



//excel


function exportToExcel() {
    // Use a variável filteredExpenses (já filtrada)
    const data = filteredExpenses.map(expense => [
        expense.driver,    // Motorista
        expense.store,     // Loja
        expense.amount,    // Valor Pago
        expense.received,  // Valor Recebido
        expense.profit,    // Lucro
        expense.date       // Data
    ]);

    // Calcular o total das saídas e o valor total
    const totalSaidas = filteredExpenses.length;
    const valorTotal = filteredExpenses.reduce((total, expense) => total + parseFloat(expense.received), 0);

    // Adicionar uma linha de total ao final dos dados
    data.push([]); // Linha em branco para separação
    data.push(['Total das Saídas', '', '', '', '', totalSaidas]);
    data.push(['Valor Total', '', '', '', '', valorTotal.toFixed(2)]);

    // Crie uma planilha (worksheet) com os dados
    const ws = XLSX.utils.aoa_to_sheet([
        ['Motorista', 'Loja', 'Valor Pago', 'Valor Recebido', 'Lucro', 'Data'], // Cabeçalho
        ...data // Dados
    ]);

    // Crie um livro (workbook) e adicione a planilha
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Saídas');

    // Exporte o arquivo Excel
    XLSX.writeFile(wb, 'Relatorio_Saidas.xlsx');
}

// Adicione um evento ao botão de exportação
document.getElementById('export-excel').addEventListener('click', exportToExcel);
    // Carregar todas as saídas ao iniciar
  
    
   // loadExpenses();

// Verifica se os elementos existem antes de manipular
if(filterStartDate && filterEndDate) {
    const today = new Date().toISOString().split('T')[0];
    filterStartDate.value = today;
    filterEndDate.value = today;
    applyFilters();
}








    
});




// whats

// Variáveis de elementos com novos IDs
// Seleciona os elementos sem conflitos
const whatsappSchedulerSend = document.getElementById('whatsapp-scheduler-send');
const whatsappSchedulerMessage = document.getElementById('whatsapp-scheduler-message');
const whatsappSchedulerNumber = document.getElementById('whatsapp-scheduler-number');
const whatsappSchedulerButtons = document.querySelectorAll('.whatsapp-scheduler-message-button');

// Enviar mensagem para o WhatsApp
whatsappSchedulerSend.addEventListener('click', function () {
    const phoneNumber = whatsappSchedulerNumber.value.trim();
    const message = whatsappSchedulerMessage.value.trim();

    if (phoneNumber === "") {
        alert("Por favor, insira o número de WhatsApp.");
        return;
    }

    if (message === "") {
        alert("Por favor, selecione ou digite uma mensagem.");
        return;
    }

    const formattedPhoneNumber = phoneNumber.replace(/\D/g, ""); // Remove caracteres não numéricos
    const whatsappUrl = `https://wa.me/${formattedPhoneNumber}?text=${encodeURIComponent(message)}`;

    // Redireciona para o WhatsApp
    window.open(whatsappUrl, '_blank');
});

// Configura mensagens predefinidas ao clicar nos botões
whatsappSchedulerButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        const message = button.getAttribute('data-message');
        whatsappSchedulerMessage.value = message;
    });
});
