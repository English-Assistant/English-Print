你是一位资深的小学英语教辅内容生成专家。请严格按照我的指令，根据我提供的单元核心信息，为我生成一套完整的教学与测评材料。

所有生成内容必须在逻辑上完全一致。特别是，试卷中的听力题必须严格源自你所创作的听力素材。

---

**【输入信息】**

- **单元标题：**

Unit 6

- **核心单词：**

christmas、father christmas、christmas tree、card、present、new year、merry、too、heare、for、thank、happy

- **重点句型：**

Here is a present for you.
Thank you.
=====
Happy New Year!
You too!
Here is a card for you.
Thank you.

---

**【输出指令】**

请严格按照以下五个部分的顺序和格式要求，**分别独立生成并输出**五块内容。

**1. 第一部分：听力素材 (纯文本)**

- **核心要求**：生成 **8-10 组简短的、独立的问答式对话**。
- **内容**：每一组对话都必须围绕输入的核心单词和句型展开。
- **目的**：这些独立的对话将直接作为听力题的素材，旨在提供更密集、更有针对性的听力训练。请根据输入的单词和句型，自动推断并构建合适的微型语境。
- **限制**: 生成的内容必须不含歧义，不包含图片内容，纯文本对话的形式。

**2. 第二部分：课程导读 (Markdown格式)**

- **要求**：严格按照以下结构和语言风格（亲切、清晰，适合一二年级）生成Markdown格式的课程导读。
  - `## Unit X 导读`
  - `### 📘 单元目标` (一句话总结)
  - `### 🧠 预备知识回顾` (需要复习的旧知识点，如果没有忽略)
  - `### 📚 本单元词汇` (英文 + 中文翻译列表)
  - `### 🔠 核心句型` (注解结构和含义)
  - `### 📝 常见错误提醒` (易混淆点)
  - `### 📖 示例练习题型` (列出练习形式)
  - `### 🎯 学习小贴士` (鼓励性建议)

**3. 第三部分：抄写练习 (JSON格式)**

- **要求**：
  - 输入的内容如果包括之前的旧知识点则还需要复习之前内容，占比5%。
  - 生成一个JSON对象，该对象必须严格符合下面的 JSON Schema 格式，但是注意不是输出 JSON Schema。

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Unit Schema",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "The title of the unit"
    },
    "word_copy": {
      "type": "array",
      "description": "List of words for copying",
      "items": {
        "type": "string"
      }
    },
    "sentence_copy": {
      "type": "array",
      "description": "List of sentences for copying",
      "items": {
        "type": "string"
      }
    },
    "sentence_transform": {
      "type": "array",
      "description": "List of sentences for transformation copying",
      "items": {
        "type": "string"
      }
    }
  },
  "required": ["title", "word_copy", "sentence_copy", "sentence_transform"]
}
```

**4. 第四部分：单元试卷 (JSON格式)**

- **要求**：生成一个包含约50道题的JSON对象，该对象必须严格符合 `EnglishExamSheet` Schema 格式，但是注意不是输出 JSON Schema。
  - 听力部分的 `questions` 应从第一部分生成对话中进行构建，包含三种类型：1. 听单词选择相关A、B、C、D, 2. 判断正误, 3.回录音回答问题。
  - 听力部分禁止出现跟听力素材不一致问题。
  - 听力的问题序号，跟听力素材的序列需要保持一致。
  - 包含5-8道复习旧知识的题目，如果没有忽略。
  - 所有题目必须有唯一的 `id`。

EnglishExamSheet JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "EnglishExerciseSheet_TestPaper",
  "description": "小学英语练习试卷结构定义（学生作答部分，不含答案）",
  "type": "object",
  "properties": {
    "unit": {
      "type": "string",
      "description": "单元名称，如 'Unit 5'"
    },
    "title": {
      "type": "string",
      "description": "试卷标题，如 'Unit 5 练习卷 A'"
    },
    "sections": {
      "type": "array",
      "description": "练习卷的各部分题型",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "description": "题型分类标识，如 vocabulary_fill, sentence_pattern, listening_match, etc.",
            "enum": [
              "vocabulary_fill",
              "vocabulary_translate",
              "sentence_fill",
              "sentence_translate",
              "guided_writing",
              "reading_comprehension",
              "listening_match",
              "review_mix"
            ]
          },
          "title": {
            "type": "string",
            "description": "该部分题型标题，如 '一、词汇填空'"
          },
          "instructions": {
            "type": "string",
            "description": "题型说明，指导学生如何作答"
          },
          "questions": {
            "type": "array",
            "description": "题目列表，每道题按顺序编号",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "description": "题目唯一编号或序号"
                },
                "question": {
                  "type": "string",
                  "description": "题干内容，支持使用 __ 表示填空"
                },
                "options": {
                  "type": "array",
                  "description": "用于选择题的选项列表（若为选择题时必填）",
                  "items": {
                    "type": "string"
                  }
                }
              },
              "required": ["id", "question"]
            }
          }
        },
        "required": ["type", "title", "questions"]
      }
    }
  },
  "required": ["unit", "title", "sections"]
}
```

**5. 第五部分：试卷答案 (JSON格式)**

- **要求**：
  - 生成一个JSON对象，该对象必须严格符合 `EnglishExamAnswerSheet` Schema。但是注意不是输出 JSON Schema。
  - `id` 与试卷完全对应。

EnglishExamAnswerSheet JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "EnglishExerciseSheet_AnswerKey",
  "description": "小学英语练习试卷参考答案结构定义（教师/家长使用）",
  "type": "object",
  "properties": {
    "unit": {
      "type": "string",
      "description": "单元名称，用于标识答案对应的试卷"
    },
    "title": {
      "type": "string",
      "description": "试卷标题，用于标识答案对应的试卷"
    },
    "sections": {
      "type": "array",
      "description": "答案按试卷的各部分题型组织",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "description": "题型分类标识，与试卷保持一致"
          },
          "title": {
            "type": "string",
            "description": "该部分题型标题，如 '一、词汇填空'"
          },
          "questions": {
            "type": "array",
            "description": "答案列表",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "description": "题目唯一编号或序号，用于和试卷题目对应"
                },
                "question": {
                  "type": "string",
                  "description": "题干内容（可选，用于核对上下文）"
                },
                "answer": {
                  "type": "string",
                  "description": "该题的正确答案"
                }
              },
              "required": ["id", "answer"]
            }
          }
        },
        "required": ["type", "title", "questions"]
      }
    }
  },
  "required": ["unit", "title", "sections"]
}
```

---

请现在开始生成。
