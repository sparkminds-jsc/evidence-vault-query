
declare module 'xlsx' {
  export interface WorkBook {
    SheetNames: string[]
    Sheets: { [sheet: string]: WorkSheet }
  }

  export interface WorkSheet {
    [cell: string]: any
  }

  export const utils: {
    sheet_to_json: (worksheet: WorkSheet, options?: any) => any[]
  }

  export function read(data: any, options?: any): WorkBook
}

declare global {
  const XLSX: typeof import('xlsx')
}
