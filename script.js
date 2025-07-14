document.addEventListener('DOMContentLoaded', () => {
    // Preencher a data da avaliação automaticamente
    const dataAvaliacaoInput = document.getElementById('data-avaliacao');
    const hoje = new Date();
    dataAvaliacaoInput.value = hoje.toLocaleDateString('pt-BR');

    // Calcular idade automaticamente quando a data de nascimento for alterada
    const dataNascimentoInput = document.getElementById('data-nascimento');
    const idadeInput = document.getElementById('idade');

    dataNascimentoInput.addEventListener('change', () => {
        const dataNascimento = new Date(dataNascimentoInput.value);
        const hoje = new Date();
        
        if (dataNascimento && dataNascimento <= hoje) {
            let idade = hoje.getFullYear() - dataNascimento.getFullYear();
            const mesAtual = hoje.getMonth();
            const mesNascimento = dataNascimento.getMonth();
            
            if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < dataNascimento.getDate())) {
                idade--;
            }
            
            idadeInput.value = `${idade} anos`;
        } else {
            idadeInput.value = '';
        }
    });

    // Mostrar/ocultar campos específicos por sexo
    const sexoSelect = document.getElementById('sexo');
    const camposMulher = document.getElementById('campos-mulher');
    const camposHomem = document.getElementById('campos-homem');

    sexoSelect.addEventListener('change', () => {
        const sexo = sexoSelect.value;
        
        if (sexo === 'mulher') {
            camposMulher.classList.remove('hidden');
            camposMulher.classList.add('fade-in');
            camposHomem.classList.add('hidden');
        } else if (sexo === 'homem') {
            camposHomem.classList.remove('hidden');
            camposHomem.classList.add('fade-in');
            camposMulher.classList.add('hidden');
        } else {
            camposMulher.classList.add('hidden');
            camposHomem.classList.add('hidden');
        }
    });

    // Informações dos órgãos para diagnóstico
    const orgaoInfo = {
        'Fígado': 'Armazena o sangue, regula o fluxo do Qi e emoções como raiva e frustração. Relacionado à visão e tendões.',
        'Baço': 'Transforma e transporta nutrientes e líquidos. Relacionado à digestão, músculos, concentração e preocupação.',
        'Rim': 'Armazena a essência (Jing), controla crescimento, reprodução, ossos, audição e força de vontade. Emoção: medo.',
        'Coração': 'Governa o sangue e abriga o Shen (mente). Relacionado à alegria, consciência e circulação.',
        'Pulmão': 'Controla a respiração e o Qi. Rege a pele, a voz e as emoções como tristeza e melancolia.',
        'Estômago': 'Responsável pela digestão e assimilação de alimentos. Trabalha com o Baço.',
        'Vesícula Biliar': 'Armazena bile e auxilia na digestão. Relacionada à coragem e tomada de decisões.',
        'Intestino Grosso': 'Elimina resíduos. Relacionado à clareza mental e capacidade de deixar ir.',
        'Bexiga': 'Armazena e elimina urina. Relacionada à força de vontade e determinação.',
        'Útero': 'Conectado ao Rim e ao Fígado. Responsável pela reprodução e ciclo menstrual.',
        'Shen': 'Representa a mente, espírito e consciência. Abrigado no Coração, essencial para equilíbrio emocional.',
        'Qi': 'Energia vital que circula pelo corpo. Fundamental para todas as funções orgânicas.',
        'Yin': 'Aspecto nutritivo, refrescante e calmante da energia. Relacionado aos líquidos corporais.',
        'Sangue': 'Nutre e umedece os tecidos. Relacionado à circulação e nutrição celular.'
    };

    // Lógica para gerar a avaliação
    const gerarAvaliacaoBtn = document.getElementById('gerar-avaliacao');
    const resultadoSection = document.getElementById('resultado-avaliacao');

    let currentEvaluationData = null; // Variável para armazenar a avaliação atual

    gerarAvaliacaoBtn.addEventListener('click', () => {
        // Validar campos obrigatórios
        const nome = document.getElementById('nome').value;
        const dataNascimento = document.getElementById('data-nascimento').value;
        const sexo = document.getElementById('sexo').value;
        const profissao = document.getElementById('profissao').value;

        if (!nome || !dataNascimento || !sexo) {
            alert('⚠️ Por favor, preencha todos os campos obrigatórios (Nome, Data de Nascimento e Sexo).');
            return;
        }

        // Resetar o estado do botão salvar
        const salvarBtn = document.getElementById('salvar-historico');
        salvarBtn.classList.remove('hidden');
        salvarBtn.disabled = false;
        salvarBtn.textContent = '💾 Salvar no Histórico';

        // Obter técnicas selecionadas
        const tecnicasSelecionadas = [];
        document.querySelectorAll('input[name="tecnica"]:checked').forEach(checkbox => {
            tecnicasSelecionadas.push(checkbox.value);
        });

        // Obter sintomas selecionados e calcular pontuação dos órgãos
        const pontuacaoOrgaos = {};
        const anomaliasSintomas = [];
        const sintomasDetalhados = [];

        document.querySelectorAll('#ficha-completa input[type="checkbox"]:checked').forEach(checkbox => {
            const orgaos = checkbox.dataset.orgao ? checkbox.dataset.orgao.split(',') : [];
            const descricao = checkbox.dataset.descricao || '';
            const diagnostico = checkbox.dataset.diagnostico || '';
            
            orgaos.forEach(orgao => {
                if (orgao.trim()) {
                    pontuacaoOrgaos[orgao.trim()] = (pontuacaoOrgaos[orgao.trim()] || 0) + 1;
                }
            });
            
            const textoSintoma = checkbox.parentElement.textContent.trim();
            anomaliasSintomas.push(textoSintoma);
            
            if (diagnostico) {
                sintomasDetalhados.push({
                    sintoma: textoSintoma,
                    diagnostico: diagnostico,
                    orgaos: orgaos
                });
            }
        });

        // Armazenar dados da avaliação para salvar posteriormente
        currentEvaluationData = {
            id: Date.now(),
            nome,
            dataNascimento,
            idade: document.getElementById('idade').value,
            sexo,
            profissao,
            dataAvaliacao: document.getElementById('data-avaliacao').value,
            sintomas: anomaliasSintomas,
            pontuacaoOrgaos,
            tecnicasSelecionadas,
            sintomasDetalhados, // Adicionado para salvar diagnóstico detalhado
        };

        // Exibir resultados
        exibirDadosPaciente(nome, dataNascimento, sexo, profissao);
        exibirAnomaliasSintomas(anomaliasSintomas);
        exibirDiagnosticoInterpretacao(sintomasDetalhados, pontuacaoOrgaos);
        exibirPontuacaoOrgaos(pontuacaoOrgaos);
        exibirPlanoTerapeutico(pontuacaoOrgaos, tecnicasSelecionadas);

        // Mostrar seção de resultado com animação
        resultadoSection.classList.remove('hidden');
        resultadoSection.classList.add('slide-in');
        
        // Scroll suave para o resultado
        resultadoSection.scrollIntoView({ behavior: 'smooth' });

        // A remoção da chamada de salvarAvaliacao daqui
    });

    // Adicionar evento para o botão de salvar
    document.getElementById('salvar-historico').addEventListener('click', () => {
        if (currentEvaluationData) {
            salvarAvaliacao(currentEvaluationData);
            const salvarBtn = document.getElementById('salvar-historico');
            salvarBtn.textContent = '✅ Salvo com Sucesso!';
            salvarBtn.disabled = true;
            currentEvaluationData = null; // Prevenir ressalvar
        }
    });

    // Função para salvar avaliação no localStorage
    function salvarAvaliacao(avaliacaoData) {
        if (!avaliacaoData) return;

        try {
            const avaliacoesAnteriores = JSON.parse(localStorage.getItem('avaliacoesMTC')) || [];
            avaliacoesAnteriores.push(avaliacaoData);
            localStorage.setItem('avaliacoesMTC', JSON.stringify(avaliacoesAnteriores));
            console.log('Avaliação salva com sucesso no histórico local.');
        } catch (error) {
            console.error('Erro ao salvar avaliação no histórico:', error);
            alert('Não foi possível salvar a avaliação no histórico. O armazenamento local pode estar cheio ou desativado.');
        }
    }

    // Função para imprimir resultado
    document.getElementById("imprimir-resultado").addEventListener("click", () => {
        const printContent = document.getElementById("resultado-avaliacao").innerHTML;
        const originalBody = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalBody;
        location.reload(); // Recarrega a página para restaurar o conteúdo original
    });

    function exibirDadosPaciente(nome, dataNascimento, sexo, profissao) {
        const container = document.getElementById('dados-paciente-resultado');
        const idade = document.getElementById('idade').value;
        
        container.innerHTML = `
            <h3>📋 Dados do Paciente</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <p><strong>👤 Nome:</strong> ${nome}</p>
                <p><strong>🎂 Data de Nascimento:</strong> ${new Date(dataNascimento).toLocaleDateString('pt-BR')}</p>
                <p><strong>📊 Idade:</strong> ${idade}</p>
                <p><strong>💼 Profissão:</strong> ${profissao || 'Não informado'}</p>
                <p><strong>⚧ Sexo:</strong> ${sexo === 'mulher' ? '👩 Mulher' : '👨 Homem'}</p>
                <p><strong>📅 Data da Avaliação:</strong> ${document.getElementById('data-avaliacao').value}</p>
            </div>
        `;
    }

    function exibirAnomaliasSintomas(sintomas) {
        const container = document.getElementById('anomalias-sintomas');
        if (sintomas.length > 0) {
            container.innerHTML = `
                <h3>📋 Anomalias/Sintomas Encontrados</h3>
                <ul>
                    ${sintomas.map(sintoma => `<li>${sintoma}</li>`).join('')}
                </ul>
            `;
        } else {
            container.innerHTML = `
                <div class="diagnostico-texto">
                    <h3>🧭 Avaliação Energética (MTC)</h3>
                    <p>✨ Nenhuma desarmonia energética identificada. O paciente apresenta equilíbrio nos padrões energéticos avaliados segundo os princípios da Medicina Tradicional Chinesa.</p>
                </div>
            `;
        }
    }

    function exibirDiagnosticoInterpretacao(sintomasDetalhados, pontuacao) {
        const container = document.getElementById('diagnostico-interpretacao');
        
        if (sintomasDetalhados.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Agrupar sintomas por órgão mais afetado
        const orgaoMaisAfetado = Object.keys(pontuacao).reduce((a, b) => pontuacao[a] > pontuacao[b] ? a : b);
        const orgaosAfetados = Object.keys(pontuacao).filter(orgao => pontuacao[orgao] > 0);

        let interpretacao = `
            <div class="diagnostico-texto">
                <h3>🔍 Interpretação Diagnóstica</h3>
                <p><strong>🎯 Órgão mais afetado:</strong> ${orgaoMaisAfetado} (${pontuacao[orgaoMaisAfetado]} pontos)</p>
                <p><strong>📊 Órgãos envolvidos:</strong> ${orgaosAfetados.join(', ')}</p>
                
                <h4>💡 Análise Energética:</h4>
        `;

        // Adicionar informação sobre o órgão mais afetado
        if (orgaoInfo[orgaoMaisAfetado]) {
            interpretacao += `<p><strong>${orgaoMaisAfetado}:</strong> ${orgaoInfo[orgaoMaisAfetado]}</p>`;
        }

        // Adicionar padrões identificados
        interpretacao += `
                <h4>🔬 Padrões Identificados:</h4>
                <ul>
        `;

        sintomasDetalhados.slice(0, 5).forEach(item => {
            interpretacao += `<li><strong>${item.sintoma.split(' ')[0]}:</strong> ${item.diagnostico}</li>`;
        });

        interpretacao += `
                </ul>
                
                <p style="margin-top: 15px; font-style: italic;">
                    💫 <strong>Recomendação:</strong> O padrão energético sugere desequilíbrio no sistema ${orgaoMaisAfetado.toLowerCase()}, 
                    requerendo harmonização através das técnicas selecionadas e ajustes no estilo de vida.
                </p>
            </div>
        `;

        container.innerHTML = interpretacao;
    }

    function exibirPontuacaoOrgaos(pontuacao) {
        const container = document.getElementById('pontuacao-orgao');
        
        if (Object.keys(pontuacao).length === 0) {
            container.innerHTML = '';
            return;
        }

        // Ordenar órgãos por pontuação
        const orgaosOrdenados = Object.entries(pontuacao)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8); // Mostrar apenas os 8 mais afetados

        let html = '<h3>🩺 Pontuação por Órgão/Sistema</h3>';
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">';
        
        orgaosOrdenados.forEach(([orgao, pontos]) => {
            const porcentagem = Math.min((pontos / Math.max(...Object.values(pontuacao))) * 100, 100);
            html += `
                <div style="background: linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 100%); padding: 10px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                    <strong>${orgao}:</strong> ${pontos} ponto${pontos > 1 ? 's' : ''}
                    <div style="background: #e9d5ff; height: 6px; border-radius: 3px; margin-top: 5px;">
                        <div style="background: #8b5cf6; height: 100%; width: ${porcentagem}%; border-radius: 3px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Adicionar informações dos órgãos mais afetados
        html += '<div style="margin-top: 20px;">';
        orgaosOrdenados.slice(0, 3).forEach(([orgao]) => {
            if (orgaoInfo[orgao]) {
                html += `<div class="orgao-info"><strong>${orgao}:</strong> ${orgaoInfo[orgao]}</div>`;
            }
        });
        html += '</div>';
        
        container.innerHTML = html;
    }

    function exibirPlanoTerapeutico(pontuacao, tecnicas) {
        const container = document.getElementById('plano-terapeutico');
        
        if (tecnicas.length === 0) {
            container.innerHTML = `
                <div class="diagnostico-texto" style="background: linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%); border-left-color: #ef4444;">
                    <p>⚠️ <strong>Nenhuma técnica selecionada.</strong></p>
                    <p>Para gerar um plano terapêutico completo, selecione pelo menos uma técnica na seção "🧰 Técnicas Terapêuticas a Utilizar".</p>
                </div>
            `;
            return;
        }

        const orgaosComPontuacao = Object.keys(pontuacao).filter(orgao => pontuacao[orgao] > 0);

        if (orgaosComPontuacao.length === 0) {
            container.innerHTML = `
                <div class="diagnostico-texto">
                    <h3>🛠️ Plano Terapêutico</h3>
                    <p>✨ Nenhum desequilíbrio energético identificado. Recomenda-se manutenção preventiva com as técnicas selecionadas para preservar o equilíbrio energético.</p>
                </div>
            `;
            return;
        }

        let html = '<h3>🛠️ Plano Terapêutico Personalizado</h3>';
        html += '<p style="font-style: italic; color: #7c3aed; margin-bottom: 20px;">✨ Baseado nos desequilíbrios energéticos identificados:</p>';

        tecnicas.forEach(tecnica => {
            html += `<div style="background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px; margin: 15px 0; border-radius: 12px; border: 2px solid #e2e8f0;">`;
            html += `<h4 style="color: #6b46c1; margin-bottom: 15px;">${getTecnicaIcon(tecnica)} ${tecnica}</h4>`;
            
            let sugestoesAdicionadas = new Set();
            let temSugestoes = false;
            
            // Ordenar órgãos por pontuação para priorizar tratamento
            const orgaosOrdenados = orgaosComPontuacao
                .sort((a, b) => pontuacao[b] - pontuacao[a])
                .slice(0, 5); // Limitar a 5 órgãos principais
            
            orgaosOrdenados.forEach(orgao => {
                const sugestao = obterSugestaoTratamento(tecnica, orgao);
                if (sugestao && !sugestoesAdicionadas.has(sugestao)) {
                    html += `
                        <div style="margin: 10px 0; padding: 10px; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
                            <strong style="color: #6b46c1;">${orgao} (${pontuacao[orgao]} ponto${pontuacao[orgao] > 1 ? 's' : ''}):</strong> 
                            <span style="color: #4a5568;">${sugestao}</span>
                        </div>
                    `;
                    sugestoesAdicionadas.add(sugestao);
                    temSugestoes = true;
                }
            });
            
            if (!temSugestoes) {
                html += `<p style="color: #718096; font-style: italic;">Aplicação geral para harmonização energética.</p>`;
            }
            
            html += '</div>';
        });

        // Adicionar observações importantes
        html += `
            <div class="diagnostico-texto" style="margin-top: 20px;">
                <h4>📝 Observações Importantes:</h4>
                <ul style="list-style-type: disc; padding-left: 20px;">
                    <li>O tratamento deve ser personalizado conforme a evolução do paciente</li>
                    <li>Recomenda-se reavaliação após 4-6 sessões</li>
                    <li>Combinar as técnicas selecionadas potencializa os resultados</li>
                    <li>Manter regularidade no tratamento é fundamental para eficácia</li>
                </ul>
            </div>
        `;

        container.innerHTML = html;
    }

    function getTecnicaIcon(tecnica) {
        const icons = {
            'Auriculoterapia': '👂',
            'Tui Na': '💆‍♀️',
            'Moxabustão': '🔥',
            'Dietoterapia': '🍵',
            'Floral de Bach': '🌺'
        };
        return icons[tecnica] || '✨';
    }

    function obterSugestaoTratamento(tecnica, orgao) {
        const tratamentos = {
            'Auriculoterapia': {
                'Fígado': 'Ponto Fígado, Ponto Shen Men, Ponto Ansiedade',
                'Coração': 'Ponto Coração, Ponto Subcórtex, Ponto Ansiedade',
                'Pulmão': 'Ponto Pulmão, Ponto Asma, Ponto Mestre do Pulmão',
                'Baço': 'Ponto Baço, Ponto Estômago, Ponto Metabolismo',
                'Rim': 'Ponto Rim, Ponto Córtex Adrenal, Ponto Genital',
                'Estômago': 'Ponto Estômago, Ponto Boca, Ponto Ansiedade',
                'Intestino Grosso': 'Ponto IG, Ponto Estômago, Ponto Imunidade',
                'Bexiga': 'Ponto Bexiga, Ponto Rim, Ponto Sistema Urinário',
                'Vesícula Biliar': 'Ponto VB, Ponto Fígado, Ponto Estresse',
                'Triplo Aquecedor': 'Ponto SJ, Ponto Regulação Endócrina',
                'Pericárdio': 'Ponto CS, Ponto Coração, Ponto Emoção'
            },
            'Tui Na': {
                'Fígado': 'LV3 (Taichong), GB34 (Yanglingquan), LI4 (Hegu)',
                'Coração': 'HT7 (Shenmen), PC6 (Neiguan), CV17 (Shanzhong)',
                'Pulmão': 'LU9 (Taiyuan), LU1 (Zhongfu), LI11 (Quchi)',
                'Baço': 'SP6 (Sanyinjiao), ST36 (Zusanli), SP9 (Yinlingquan)',
                'Rim': 'KI3 (Taixi), BL23 (Shenshu), CV4 (Guanyuan)',
                'Estômago': 'ST36 (Zusanli), ST25 (Tianshu), CV12 (Zhongwan)',
                'Intestino Grosso': 'ST25 (Tianshu), LI4 (Hegu), ST37 (Shangjuxu)',
                'Bexiga': 'BL28 (Pangguangshu), CV3 (Zhongji), BL23 (Shenshu)',
                'Vesícula Biliar': 'GB34 (Yanglingquan), LV3 (Taichong), GB20 (Fengchi)',
                'Triplo Aquecedor': 'SJ5 (Waiguan), SJ17 (Yifeng), GB20 (Fengchi)',
                'Pericárdio': 'PC6 (Neiguan), HT7 (Shenmen), CV17 (Shanzhong)'
            },
            'Moxabustão': {
                'Fígado': 'LV3 (Taichong), BL18 (Ganshu)',
                'Coração': 'HT7 (Shenmen), CV14 (Juque)',
                'Pulmão': 'LU1 (Zhongfu), BL13 (Feishu)',
                'Baço': 'SP6 (Sanyinjiao), ST36 (Zusanli), BL20 (Pishu)',
                'Rim': 'KI3 (Taixi), BL23 (Shenshu), CV4 (Guanyuan)',
                'Estômago': 'ST36 (Zusanli), CV12 (Zhongwan)',
                'Intestino Grosso': 'ST25 (Tianshu), ST37 (Shangjuxu)',
                'Bexiga': 'BL28 (Pangguangshu), BL23 (Shenshu)',
                'Vesícula Biliar': 'GB34 (Yanglingquan), BL19 (Danshu)',
                'Triplo Aquecedor': 'SJ5 (Waiguan), GB20 (Fengchi)',
                'Pericárdio': 'PC6 (Neiguan), BL14 (Jueyinshu)'
            },
            'Dietoterapia': {
                'Fígado': 'Alimentos verdes (brócolis, couve), chá de boldo, limão, alcachofra',
                'Coração': 'Alimentos vermelhos (tomate, cereja), chá de erva-doce, aveia',
                'Pulmão': 'Pera cozida, nabo, sementes de linhaça, mel, arroz branco',
                'Baço': 'Abóbora, inhame, grão de bico, arroz integral, batata-doce',
                'Rim': 'Feijão preto, nozes, gergelim preto, castanha-do-pará, água morna',
                'Estômago': 'Batata-doce, arroz cateto, gengibre, mamão, banana',
                'Intestino Grosso': 'Ameixa, mamão, linhaça, alimentos ricos em fibra, água',
                'Bexiga': 'Chá de salsa, milho (cabelo), cevada, melancia',
                'Vesícula Biliar': 'Alcachofra, limão, chá verde, agrião, rabanete',
                'Triplo Aquecedor': 'Cogumelos, gengibre, alimentos mornos, chás digestivos',
                'Pericárdio': 'Chá de camomila, aveia, leite de amêndoas, tâmaras'
            },
            'Floral de Bach': {
                'Fígado': 'Holly (raiva), Willow (ressentimento), Impatiens (irritabilidade)',
                'Coração': 'Vervain (tensão), Impatiens (pressa), Agrimony (ansiedade oculta)',
                'Pulmão': 'Honeysuckle (nostalgia), Gorse (desespero), Star of Bethlehem (trauma)',
                'Baço': 'White Chestnut (preocupação), Gentian (desânimo), Cerato (indecisão)',
                'Rim': 'Mimulus (medos conhecidos), Aspen (medos vagos), Rock Rose (pânico)',
                'Estômago': 'Beech (intolerância), Rock Water (rigidez), Crab Apple (limpeza)',
                'Vesícula Biliar': 'Scleranthus (indecisão), Hornbeam (cansaço mental)',
                'Pericárdio': 'Walnut (proteção), Agrimony (máscara emocional)',
                'Triplo Aquecedor': 'Clematis (dispersão), Chestnut Bud (repetição de padrões)'
            }
        };

        return tratamentos[tecnica] ? tratamentos[tecnica][orgao] : null;
    }
});