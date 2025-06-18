# EnglishPrint

EnglishPrint 是一款帮助学习者 **打印 A4 纸质练习** 的前端应用，旨在通过 AI 生成的内容提升英语学习效率。

> 说明：试卷内容由 AI（如 OpenAI、Gemini）生成后，再填充至本项目并进行打印。

## 功能结构

| 模块     | 说明                                                        | 相关文档                                           |
| -------- | ----------------------------------------------------------- | -------------------------------------------------- |
| 课程管理 | 定义课程，如 _New Concept English 1_、_Grimm's Fairy Tales_ | —                                                  |
| 试卷管理 | 管理课程下的具体单元，如 _Lesson 1_                         | —                                                  |
| 导读     | 课前知识点讲解                                              | [Prompt 定义](/src/data/prompts/introduction.md)   |
| 抄写练习 | 重点单词、句型及变形抄写                                    | [JSON Schema](/src/data/schema/copy.schema.json)   |
| 试卷     | 听力、选择、阅读理解、造句等                                | [JSON Schema](/src/data/schema/exam.schema.json)   |
| 答案     | 参考答案                                                    | [JSON Schema](/src/data/schema/answer.schema.json) |

## 使用方式

1. **导读**：直接将 _Prompt_ 中的占位词替换为实际内容后交给 AI 生成结果，再粘贴至系统。
2. **其余模块**：根据对应的 **JSON Schema** 填充固定结构的数据，确保格式正确后导入即可。

完成内容配置后，即可打印纸质练习进行书写。
