import { expect } from '@jest/globals';
import { cleanConverterParameters, removeModbusData } from 'specification.shared';

var entity: any = { name: "test", converter: { name:"number", functionCodes:[]}, modbusValue: [3, 4, 5], mqttValue: 3, converterParameters: { uom: "kW", multiplier: 1, tobeRemoved: "tobeREmoved" } }

it('test cleanParameterType', () => {
    cleanConverterParameters(entity);
    expect(entity.converterParameters.tobeRemoved).toBeUndefined();
    expect(entity.converterParameters.uom).toBeDefined();
});
it('test removeModbusData', () => {
    removeModbusData(entity);
    expect(entity.modbusData).toBeUndefined();
    expect(entity.mqttValue).toBeUndefined();
    expect(entity.identified).toBeUndefined();
    expect(entity.converterParameters.uom).toBeDefined();
});

