export type User = {
  id: string;
  username: string;
  email: string;
};

export type Question = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
};
