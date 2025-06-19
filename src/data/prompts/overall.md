你是一位资深的小学英语教辅内容生成专家。请严格按照我的指令，根据我提供的单元核心信息，为我生成一套完整的教学与测评材料。

所有生成内容必须在逻辑上完全一致。特别是，试卷中的听力题必须严格源自你所创作的听力素材。

---

**【输入信息】**

- **单元标题：**

Unit 6

- **核心单词：**

christmas, father christmas, christmas tree, card, present, new year, merry, too, here, for, thank, happy

- **重点句型：**

Here is a present for you.
Thank you.

=====
Happy New Year!
You too!
Here is a card for you.
Thank you.

---

请严格按照以下五个部分的顺序和格式要求，**分别独立生成并输出**五块内容。每一块内容都应放入其专属的、独立的Markdown代码块中。

**1. 第一部分：听力素材 (纯文本)**

- **核心要求**：生成 **8-10 组简短的、独立的问答式对话**。
- **内容**：每一组对话都必须围绕输入的核心单词和句型展开。
- **目的**：这些独立的对话将直接作为听力题的素材，旨在提供更密集、更有针对性的听力训练。请根据输入的单词和句型，自动推断并构建合适的微型语境。
- **格式**: 将生成的纯文本对话放入一个 `text ... ` 代码块中。
- **限制**: 生成的内容必须不含歧义，纯文本对话的形式。

**2. 第二部分：课程导读 (Markdown格式)**

- **要求**：严格按照以下结构和语言风格（亲切、清晰，适合一二年级）生成课程导读。

  - # Unit X 导读
  - ## 📘 单元目标 (一句话总结)
  - ## 🧠 预备知识回顾 (明确指出需要复习的1-2个旧知识点，如果没有则忽略)
  - ## 📚 本单元词汇 (英文 + 中文翻译列表)
  - ## 🔠 核心句型 (注解结构和含义)
  - ## 📝 常见错误提醒 (易混淆点)
  - ## 📖 示例练习题型 (列出练习形式)
  - ## 🎯 学习小贴士 (鼓励性建议)

- **格式**: 将生成的Markdown内容放入一个 `markdown ... ` 代码块中。

**3. 第三部分：抄写练习 (JSON格式)**

- **要求**：

  - 生成一个JSON对象，该对象必须严格符合提供的 JSON Schema 格式。
  - 在 word_copy、sentence_copy 列表中包含 **1-2个** 复习单词和短语（如: pen, book）。

- **格式**: 将生成的JSON对象放入一个 `json ... ` 代码块中，以 JSON 包裹返回但是不是生成JSON Schame。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Unit Schema",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "单元标题"
    },
    "word_copy": {
      "type": "array",
      "description": "需要抄写的单词列表",
      "items": {
        "type": "string"
      }
    },
    "sentence_copy": {
      "type": "array",
      "description": "需要抄写的句子列表",
      "items": {
        "type": "string"
      }
    },
    "sentence_transform": {
      "type": "array",
      "description": "根据句子结构来变形来的句子列表，考虑句子的知识点，但是换一种形式来练习",
      "items": {
        "type": "string"
      }
    }
  },
  "required": ["title", "word_copy", "sentence_copy", "sentence_transform"]
}
```

**4. 第四部分：单元试卷 (JSON格式)**

- **要求**：

  - 生成一个包含 **30-35道题** 的JSON对象，严格符合下面提供的 EnglishExamSheet Schema。
  - **听力题严格约束**：

    1. 所有听力题的 questionText 或考察点必须**直接源自**第一部分生成的听力对话。
    2. 听力题的问题序号应与听力素材的对话序号保持逻辑关联。为清晰起见，可在题干中用 (听力对话 X) 标明。
    3. 对于需要配合图片的听力题（如判断正误），请在题干中直接用**文字描述图片内容**，例如：听录音，判断其内容是否与[一棵漂亮的圣诞树]的描述相符。

  - 在试卷中包含 **3-5道** 复习旧知识的题目，并在题干后用 (复习题) 标注。
  - 所有题目必须有唯一的 id。

- **格式**: 将生成的JSON对象放入一个 `json ... ` 代码块中。

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "中小学英语试卷结构定义",
  "description": "一个为定义结构化英语试卷内容设计的灵活 Schema，专为前端应用渲染优化。",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "试卷的主标题，例如 '二年级上 Unit 5 + 复习练习卷'。"
    },
    "sections": {
      "type": "array",
      "description": "试卷主要大题的数组（例如，一、二、三）。",
      "items": {
        "$ref": "#/$defs/section"
      }
    }
  },
  "required": ["title", "sections"],
  "$defs": {
    "section": {
      "type": "object",
      "description": "试卷的一个主要大题，如 '一、词汇选择 + 翻译'。",
      "properties": {
        "sectionNumber": {
          "type": "string",
          "description": "大题的序号，例如 '一', '二'。"
        },
        "title": {
          "type": "string",
          "description": "大题的标题，不包含分数。"
        },
        "points": {
          "type": "number",
          "description": "该大题的总分值。"
        },
        "instructions": {
          "type": "string",
          "description": "适用于整个大题的通用说明。"
        },
        "parts": {
          "type": "array",
          "description": "一个大题由一个或多个部分组成。例如听力题包含'听单词'、'判断正误'等多个部分。",
          "items": {
            "$ref": "#/$defs/part"
          }
        }
      },
      "required": ["title", "parts"]
    },
    "part": {
      "type": "object",
      "description": "大题内部的结构化组件，可以有自己的小标题和说明。",
      "properties": {
        "partNumber": {
          "type": "string",
          "description": "部分的可选标识符，例如 '(1)', 'A'。"
        },
        "instructions": {
          "type": "string",
          "description": "针对此部分的特定说明。"
        },
        "content": {
          "type": "array",
          "description": "构成此部分的内容项数组。允许混合文章、问题、词库等元素。",
          "items": {
            "oneOf": [
              {
                "$ref": "#/$defs/content/wordBank"
              },
              {
                "$ref": "#/$defs/content/matching"
              },
              {
                "$ref": "#/$defs/content/passage"
              },
              {
                "$ref": "#/$defs/content/question"
              }
            ]
          }
        }
      },
      "required": ["content"]
    },
    "content": {
      "wordBank": {
        "type": "object",
        "description": "用于提供选项词汇的模块。",
        "properties": {
          "type": {
            "const": "WORD_BANK"
          },
          "label": {
            "type": "string",
            "description": "词汇库的标签，例如 '选项：'"
          },
          "words": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": ["type", "words"]
      },
      "matching": {
        "type": "object",
        "description": "定义一个完整的连线匹配题。",
        "properties": {
          "type": {
            "const": "MATCHING"
          },
          "stems": {
            "type": "array",
            "description": "左侧待匹配项（题干）。",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string"
                },
                "text": {
                  "type": "string"
                }
              }
            }
          },
          "options": {
            "type": "array",
            "description": "右侧可选项（选项）。",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string"
                },
                "text": {
                  "type": "string"
                }
              }
            }
          }
        },
        "required": ["type", "stems", "options"]
      },
      "passage": {
        "type": "object",
        "description": "用于阅读理解的文章模块。",
        "properties": {
          "type": {
            "const": "READING_PASSAGE"
          },
          "text": {
            "type": "string"
          }
        },
        "required": ["type", "text"]
      },
      "question": {
        "type": "object",
        "description": "表示单个问题的通用模块。",
        "properties": {
          "type": {
            "const": "QUESTION"
          },
          "questionType": {
            "type": "string",
            "description": "问题的具体类型，决定了其 data 负载的结构。",
            "enum": [
              "FILL_IN_BLANK_AND_TRANSLATE",
              "FILL_IN_BLANK",
              "TRANSLATE_ZH_TO_EN",
              "GUIDED_WRITING",
              "MULTI_SELECT_CHOICE",
              "TRUE_FALSE",
              "OPEN_ENDED"
            ]
          },
          "data": {
            "type": "object",
            "description": "问题的具体内容，其结构取决于 questionType。"
          }
        },
        "required": ["type", "questionType", "data"]
      }
    }
  }
}
```

**5. 第五部分：试卷答案 (JSON格式)**

- **要求**：

  - 生成一个JSON对象，严格符合下面提供的 EnglishExamAnswerSheet Schema。
  - 答案中的所有id和结构必须与第四部分生成的试卷**完全对应**。
  - 答案JSON的整体结构（sections, parts）应**镜像**试卷的结构，以确保一一对应。

- **格式**: 将生成的JSON对象放入一个 `json ... ` 代码块中。

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "英语试卷答案结构定义",
  "description": "一个与试卷结构完全匹配的答案 Schema，用于存储参考答案和评分标准，支持自动批改。",
  "type": "object",
  "properties": {
    "paperId": {
      "type": "string",
      "description": "对应试卷的唯一ID，确保答案和试卷能精确匹配。"
    },
    "title": {
      "type": "string",
      "description": "试卷的标题（可选，用于核对）。"
    },
    "sections": {
      "type": "array",
      "description": "答案按试卷的大题结构组织。",
      "items": {
        "$ref": "#/$defs/answerSection"
      }
    }
  },
  "required": ["paperId", "sections"],
  "$defs": {
    "answerSection": {
      "type": "object",
      "properties": {
        "sectionNumber": {
          "type": "string"
        },
        "parts": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/answerPart"
          }
        }
      }
    },
    "answerPart": {
      "type": "object",
      "properties": {
        "partNumber": {
          "type": "string"
        },
        "content": {
          "type": "array",
          "items": {
            "oneOf": [
              {
                "$ref": "#/$defs/answeredMatching"
              },
              {
                "$ref": "#/$defs/answeredQuestion"
              }
            ]
          }
        }
      }
    },
    "answeredMatching": {
      "type": "object",
      "description": "对整个匹配题提供答案。",
      "properties": {
        "type": {
          "const": "MATCHING"
        },
        "answer": {
          "type": "object",
          "description": "以键值对形式提供匹配关系，键是题干ID，值是选项ID。",
          "additionalProperties": {
            "type": "string"
          }
        }
      },
      "required": ["type", "answer"]
    },
    "answeredQuestion": {
      "type": "object",
      "description": "对单个问题提供答案。",
      "properties": {
        "type": {
          "const": "QUESTION"
        },
        "questionType": {
          "type": "string"
        },
        "answer": {
          "description": "答案的具体内容，其类型取决于问题类型。",
          "oneOf": [
            {
              "type": "string",
              "description": "用于填空、翻译、简答等。"
            },
            {
              "type": "boolean",
              "description": "用于判断题。"
            },
            {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "用于多选题或有多个可能答案的开放题。"
            }
          ]
        }
      },
      "required": ["type", "questionType", "answer"]
    }
  }
}
```

---

请现在开始生成。
