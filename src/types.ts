export interface Atom {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

export type SearchResult = Atom & {
  distance: number;
};
