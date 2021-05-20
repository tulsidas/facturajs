import { toDataURL } from 'qrcode';
import moment = require('moment');
import * as fs from 'fs';
// import nodeHtmlToImage from 'node-html-to-image';
const nodeHtmlToImage = require('node-html-to-image'); // chau TS :_(

const zeroPad = (num: number, len: number) => String(num).padStart(len, '0');

export type RenderParams = {
  fecha: string,
  cuit: number,
  tipo: number,
  puntoVenta: number,
  numero: number,
  importe: number,
  cae: string,
  vencimientoCae: string,
  nombreCompleto: string,
  tipoDocumento?: number,
  documento?: number,
  concepto: string,
}

export async function renderFactura(input: RenderParams) {
  const archivo = `./facturas/${zeroPad(input.puntoVenta, 5)}-${zeroPad(input.numero, 8)}.png`;
  const json = `./facturas/${zeroPad(input.puntoVenta, 5)}-${zeroPad(input.numero, 8)}.json`;

  // guardar un json con los datos de la factura (en entornos prod debería ser una DB o similar)
  fs.writeFileSync(json, JSON.stringify(input));

  const qr = await toDataURL(JSON.stringify({
    ver: 1,
    fecha: moment(input.fecha).format("YYYY-MM-DD"),
    cuit: input.cuit,
    ptoVta: input.puntoVenta,
    tipoCmp: input.tipo,
    nroCmp: input.numero,
    importe: input.importe, // Decimal hasta 13 enteros y 2 decimales
    moneda: "PES",          // PESO
    ctz: 1,                 // $1 = $1
    tipoDocRec: input.tipoDocumento ?? 99, // 96:DNI, 99:Sin Identificar
    nroDocRec: input.documento ?? 0,
    tipoCodAut: "E", // “A” para comprobante autorizado por CAEA, “E” para comprobante autorizado por CAE
    codAut: input.cae,
  }), { rendererOpts: { quality: 1 } });


  await nodeHtmlToImage({
    output: archivo,
    html: fs.readFileSync('./factura.html').toString('utf8'),
    content: {
      nombreyapellido: input.nombreCompleto,
      doc: input.documento ?? "-",
      ptoventa: zeroPad(input.puntoVenta, 5),
      numero: zeroPad(input.numero, 8),
      fecha: moment(input.fecha).format("DD/MM/YYYY"),
      concepto: input.concepto,
      importe: input.importe,
      CAE: input.cae,
      vtoCAE: moment(input.vencimientoCae).format("DD/MM/YYYY"),
      qr: qr
    }
  });
  
  console.log(`${archivo} creado ✅`);
}
