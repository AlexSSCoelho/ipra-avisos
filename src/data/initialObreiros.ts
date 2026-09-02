import type { Obreiro } from '../types';

/**
 * Relação Oficial de Obreiros da IPRA Auriflama
 * Configurada com base nas recomendações diretas do usuário:
 * - Master do sistema: Alex Coelho (Admin)
 * - Pastor Titular: Cláudio Lísias (Admin)
 * - Diácono Admin: Júlio Coelho (Admin)
 * - Menções Honrosas: Pr. José Roberto Moraes (Presidente) e Pr. Israel Firmino (Fundador)
 * - Demais pastores auxiliares, presbíteros, diáconos, diaconisas e evangelistas.
 */
export const REAL_OBREIROS_IPRA: Obreiro[] = [
  // ── ADMINISTRADOR MASTER ──
  {
    id: 'obreiro_master_alex_coelho',
    nome: 'Alex Coelho',
    cargo: 'admin',
    genero: 'homem',
    isAdmin: true,
    isMaster: true,
    ativo: true,
  },

  // ── PASTOR TITULAR & ADMIN ──
  {
    id: 'obreiro_pr_claudio_lisias',
    nome: 'Cláudio Lísias',
    cargo: 'pastor',
    genero: 'homem',
    isAdmin: true,
    ativo: true,
  },

  // ── MENÇÃO HONROSA (PASTORES EMÉRITOS IDOSOS) ──
  {
    id: 'obreiro_pr_jose_roberto_moraes',
    nome: 'José Roberto Moraes',
    cargo: 'pastor_presidente',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_pr_israel_firmino',
    nome: 'Israel Firmino',
    cargo: 'pastor_fundador',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },

  // ── PASTORES AUXILIARES ──
  {
    id: 'obreiro_pr_silas_firmino',
    nome: 'Silas Firmino',
    cargo: 'pastor_auxiliar',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_pr_silas_moreira',
    nome: 'Silas Moreira',
    cargo: 'pastor_auxiliar',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_pr_genivaldo_santos',
    nome: 'Genivaldo Santos',
    cargo: 'pastor_auxiliar',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_pr_marques_rodrigues',
    nome: 'Marques Rodrigues',
    cargo: 'pastor_auxiliar',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },

  // ── PRESBÍTEROS (PB) ──
  {
    id: 'obreiro_pb_donozor_monlevade',
    nome: 'Donozor Monlevade',
    cargo: 'presbitero',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_pb_enio_rodrigues',
    nome: 'Ênio Rodrigues',
    cargo: 'presbitero',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_pb_paulo_henrique',
    nome: 'Paulo Henrique',
    cargo: 'presbitero',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_pb_bonfim_neves',
    nome: 'Bonfim Neves',
    cargo: 'presbitero',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_pb_jandecir_tomaz',
    nome: 'Jandecir Tomaz',
    cargo: 'presbitero',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_pb_clineu_moreira',
    nome: 'Clineu Moreira',
    cargo: 'presbitero',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },

  // ── DIÁCONOS (COM JÚLIO COELHO COMO ADMIN) ──
  {
    id: 'obreiro_dc_julio_coelho',
    nome: 'Júlio Coelho',
    cargo: 'diacono',
    genero: 'homem',
    isAdmin: true,
    ativo: true,
  },
  {
    id: 'obreiro_dc_antonio_souza',
    nome: 'Antônio Souza',
    cargo: 'diacono',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_dc_isaias',
    nome: 'Isaías',
    cargo: 'diacono',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_dc_emanuel_lima',
    nome: 'Emanuel Lima',
    cargo: 'diacono',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_dc_juliano_rodrigues',
    nome: 'Juliano Rodrigues',
    cargo: 'diacono',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_dc_vanderlei',
    nome: 'Vanderlei',
    cargo: 'diacono',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_dc_rogerio_moura',
    nome: 'Rogério Moura',
    cargo: 'diacono',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },

  // ── DIACONISAS ──
  {
    id: 'obreiro_dcsa_eliana_montanaro',
    nome: 'Eliana Montanaro',
    cargo: 'diaconisa',
    genero: 'mulher',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_dcsa_nilce_lopes',
    nome: 'Nilce Lopes',
    cargo: 'diaconisa',
    genero: 'mulher',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_dcsa_suzi_lima',
    nome: 'Suzi Lima',
    cargo: 'diaconisa',
    genero: 'mulher',
    isAdmin: false,
    ativo: true,
  },

  // ── EVANGELISTAS ──
  {
    id: 'obreiro_ev_paulo_lima',
    nome: 'Paulo Lima',
    cargo: 'evangelista_h',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
  {
    id: 'obreiro_ev_ronaldo_pinhabel',
    nome: 'Ronaldo Pinhabel',
    cargo: 'evangelista_h',
    genero: 'homem',
    isAdmin: false,
    ativo: true,
  },
];
