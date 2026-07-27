import type { MortgageFileRepository } from "./repository";
import { TursoRepository } from "./turso-repository";

// Singleton — the UI always uses this.
// Swap the implementation here when Salesforce is ready.
let _repo: MortgageFileRepository | null = null;

export function getRepository(): MortgageFileRepository {
  if (!_repo) {
    _repo = new TursoRepository();
  }
  return _repo;
}