// Prisma Models
export type {
  User,
  Course,
  Paper,
  GenerationTask,
  TaskStatus,
  Vocabulary,
} from '@backend/generated/prisma';

// DTOs
export type { LoginDto } from '@backend/auth/dto/login.dto';
export type { RegisterDto } from '@backend/auth/dto/register.dto';
export type { CreateCourseDto } from '@backend/course/dto/create-course.dto';
export type { UpdateCourseDto } from '@backend/course/dto/update-course.dto';
export type { CreatePaperDto } from '@backend/paper/dto/create-paper.dto';
export type { UpdatePaperDto } from '@backend/paper/dto/update-paper.dto';
export type { UpdateDifyConfigDto } from '@backend/user/dto/update-dify-config.dto';
export type { CreateVocabularyDto } from '@backend/vocabulary/dto/create-vocabulary.dto';
export type { UpdateVocabularyDto } from '@backend/vocabulary/dto/update-vocabulary.dto';
