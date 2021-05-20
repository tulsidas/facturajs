import moment = require('moment');
import { AfipServices } from '../AfipServices';
import { IConfigService } from '../IConfigService';

const config: IConfigService = {
    certPath: './private/dev/cert.pem',
    privateKeyPath: './private/dev/private_key.key',
    // or use directly content keys if you need
    // certContents: fs.readFileSync('./private/dev/cert.pem').toString('utf8'),
    // privateKeyContents: fs.readFileSync('./private/dev/private_key.key').toString('utf8'),
    cacheTokensPath: './.lastTokens',
    homo: true,
    tokensExpireInHours: 12,
};

const afip = new AfipServices(config);

async function monotributo(importe: number, CUIT: number, DocTipo = 99, DocNro = 0, Concepto = 1) {
    const res = await afip.getLastBillNumber({
        Auth: { Cuit: CUIT },
        params: {
            CbteTipo: 11,   // factura C
            PtoVta: 2,      // 2?
        },
    });

    if (res.CbteNro) {
        console.log('Último comprobante: ', res.CbteNro);
        const next = res.CbteNro + 1;
        console.log('Comprobante a crear: ', next);
        const resBill = await afip.createBill({
            Auth: { Cuit: CUIT },
            params: {
                FeCAEReq: {
                    FeCabReq: {
                        CantReg: 1,     // crear 1 comprobante
                        PtoVta: 2,      // 2?
                        CbteTipo: 11,   // Factura C
                    },
                    FeDetReq: {
                        FECAEDetRequest: {
                            DocTipo,            // Código de documento identificatorio del comprador
                            DocNro,             // Nro. De identificación del comprador
                            Concepto,           // 1: Productos, 2: Servicios, 3: Productos y Servicios
                            CbteDesde: next,
                            CbteHasta: next,
                            CbteFch: moment().format('YYYYMMDD'),
                            ImpTotal: importe,  // Importe total del comprobante
                            ImpTotConc: 0,      // Importe neto no gravado. Para comprobantes tipo C debe ser igual a cero (0).
                            ImpNeto: importe,   // Importe neto gravado. Para comprobantes tipo C este campo corresponde al Importe del SubTotal.
                            ImpOpEx: 0,         // Importe exento. Para comprobantes tipo C debe ser igual a cero (0).
                            ImpIVA: 0,          // Suma de los importes del array de IVA. Para comprobantes tipo C debe ser igual a cero (0).
                            ImpTrib: 0,         // Suma de los importes del array de tributos
                            MonId: 'PES',
                            MonCotiz: 1,        // Cotizaciónde la moneda informada. Para PES, pesos argentinos la misma debe ser 1
                        },
                    },
                },
            },
        });
        console.log('Created bill', JSON.stringify(resBill, null, 4));
    } else {
        console.error('AFIP no devolvió el número del último comprobante :(');
    }
}

monotributo(123.45, 1234567890).catch((err) => {
    console.error('Algo falló');
    console.error(err);
});
