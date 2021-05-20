import { IConfigService } from '../IConfigService';

import { AfipServices } from '../AfipServices';

const config: IConfigService = {
    // use path or content keys:
    certPath: './private/prod/facturador-prod_316cbee3eca3d009.crt',
    privateKeyPath: './private/prod/private_key.key',
    cacheTokensPath: './.lastTokensProd',
    homo: false,
    tokensExpireInHours: 12,
};

const afip = new AfipServices(config);
const cuit = 1234567890;

afip.getLastBillNumber({
    Auth: { Cuit: cuit },
    params: {
        CbteTipo: 11,
        PtoVta: 2,
    },
}).then((res) => {
    console.dir(res);
});

afip.execRemote('wsfev1', 'FEParamGetTiposCbte', {
    Auth: { Cuit: cuit }
}).then(res => console.dir(res, { depth: null }))

afip.execRemote('wsfev1', 'FECompConsultar', {
    Auth: { Cuit: cuit },
    params: {
        FeCompConsReq: {
            CbteTipo: 11,
            PtoVta: 2,
            CbteNro: 1,
        }
    },
}).then(res => console.dir(res, { depth: null }))
