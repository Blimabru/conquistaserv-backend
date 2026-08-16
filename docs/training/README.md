# 📚 Documentos de Treinamento da IA

Coloque aqui os arquivos que a IA usará como base de conhecimento.

## Formatos aceitos

| Formato | Extensão | Exemplo |
|---------|----------|---------|
| Markdown | `.md` | Documentos estruturados, FAQs, manuais |
| PDF | `.pdf` | Legislação, portarias, editais, contratos |
| Texto puro | `.txt` | Anotações, transcrições |

## Estrutura recomendada

```
docs/training/
├── 01-sobre-o-sistema.md       # O que é o ConquistaServ
├── 02-direitos-beneficios.md   # Férias, licenças, progressão
├── 03-procedimentos.md         # Passo a passo de solicitações
├── 04-faq.md                   # Perguntas frequentes
├── legislacao.pdf              # PDFs de leis e normas
├── portarias/                  # Subpasta com portarias em PDF
│   ├── portaria-001.pdf
│   └── portaria-002.pdf
└── ...                         # Quantos arquivos quiser
```

## Dicas

- A IA lê **tudo recursivamente** — pode criar subpastas
- PDFs são convertidos automaticamente em texto
- Use títulos e subtítulos nos `.md` para organizar os temas
- Um tema por arquivo é melhor do que tudo misturado

## Após adicionar/editar arquivos

```bash
# Primeira vez ou adicionar novos docs:
curl -X POST http://localhost:3000/ai/training/ingest

# Resetar e re-treinar tudo:
curl -X POST http://localhost:3000/ai/training/reingest
```
