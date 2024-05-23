import { expect } from '@jest/globals';
import { ConverterMap } from '../src/convertermap';
import { Converters, Ientity, Ispecification, ModbusFunctionCodes } from 'specification.shared';
ConverterMap.setMqttDiscoveryLanguage("en")
function getReadRegisterResult(n: number): any {
    let one: any = {
        data: [n],
        buffer: Buffer.allocUnsafe(2)
    }
    one.buffer.writeInt16BE(n)
    return one
}
let spec: Ispecification = {
    "entities": [
        {
            "id": 1, mqttname: "mqtt",
            "converter": { name: "sensor" as Converters, functionCodes: [] }, "modbusAddress": 4, functionCode: ModbusFunctionCodes.readHoldingRegisters, "icon": "", "converterParameters": { "multiplier": 0.1, "offset": 0, "uom": "cm", "identification": { "min": 0, "max": 200 } }
        },
        { id: 2, mqttname: "mqtt2", "converter": { name: "select_sensor" as Converters, functionCodes: [] }, "modbusAddress": 2, functionCode: ModbusFunctionCodes.readHoldingRegisters, "icon": "", "converterParameters": { "optionModbusValues": [1, 2, 3] } },
        { id: 3, mqttname: "mqtt3", "converter": { name: "select_sensor" as Converters, functionCodes: [] }, "modbusAddress": 3, functionCode: ModbusFunctionCodes.readHoldingRegisters, "icon": "", "converterParameters": { "optionModbusValues": [0, 1, 2, 3] } }],
    "status": 2, "manufacturer": "unknown", "model": "QDY30A",
    "filename": "waterleveltransmitter",
    i18n: [
        {
            lang: "en", texts: [
                { textId: "e1o.1", text: "ON" },
                { textId: "e1o.0", text: "OFF" },
                { textId: "e1o.2", text: "test" }
            ]
        }
    ],
    files: []
}

it('test sensor converter', () => {
    let entity: Ientity = { id: 1, mqttname: "mqtt", converter: { name: "sensor", functionCodes: [] }, converterParameters: { multiplier: 0.01, offset: 0 }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    let sensorConverter = ConverterMap.getConverter(entity);
    let mqttValue = parseFloat(sensorConverter?.modbus2mqtt(spec, entity.id, getReadRegisterResult(5)) as string);
    expect(mqttValue).toBe(0.05);
    expect(sensorConverter?.isReadOnly).toBeTruthy();
});
it('test sensor converter with stringlength', () => {
    let entity: Ientity = { id: 1, mqttname: "mqtt", converter: { name: "sensor", functionCodes: [] }, converterParameters: { stringlength: 10 }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    let sensorConverter = ConverterMap.getConverter(entity);
    let r: any = {
        data: [5, 6, 7],
        buffer: Buffer.from([5, 6, 7])
    }
    let mqttValue = sensorConverter?.modbus2mqtt(spec, entity.id, r);
    expect(parseFloat(mqttValue as string)).toBe(5);
    expect(sensorConverter?.isReadOnly).toBeTruthy();
});
it('test binary_sensor converter', () => {
    let entity: Ientity = { id: 1, mqttname: "mqtt", converter: { name: "binary_sensor", functionCodes: [] }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    let sensorConverter = ConverterMap.getConverter(entity);
    let mqttValue = sensorConverter?.modbus2mqtt(spec, entity.id, getReadRegisterResult(0));
    expect(mqttValue).toBe("OFF");
    mqttValue = sensorConverter?.modbus2mqtt(spec, entity.id, getReadRegisterResult(1));
    expect(mqttValue).toBe("ON");
    expect(sensorConverter?.isReadOnly).toBeTruthy();
    entity = { id: 1, mqttname: "mqtt", converter: { name: "binary_sensor", functionCodes: [] }, converterParameters: { optionModbusValues: [0, 1] }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    mqttValue = sensorConverter?.modbus2mqtt(spec, entity.id, getReadRegisterResult(2));
    expect(mqttValue).toBe("ON");

});
it('test select_sensor converter', () => {
    let entity: Ientity = { id: 1, mqttname: "mqtt", converter: { name: "select_sensor", functionCodes: [] }, converterParameters: { optionModbusValues: [1, 2] }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    let sensorConverter = ConverterMap.getConverter(entity);
    let mqttValue = sensorConverter?.modbus2mqtt(spec, entity.id, getReadRegisterResult(1));
    expect(mqttValue).toBe("ON");
    mqttValue = sensorConverter?.modbus2mqtt(spec, entity.id, getReadRegisterResult(2));
    expect(mqttValue).toBe("test");
    expect(sensorConverter?.isReadOnly).toBeTruthy();
    entity = { id: 1, mqttname: "mqtt", converter: { name: "select_sensor", functionCodes: [] }, converterParameters: { optionModbusValues: [0, 1] }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    sensorConverter = ConverterMap.getConverter(entity);
});
let r68: any = {
    data: [65 << 8 | 66, 67 << 8 | 68],
    buffer: Buffer.from([65, 66, 67, 68])
}

let r69: any = {
    data: [65 << 8 | 66, 67 << 8 | 68, 69 << 8],
    buffer: Buffer.from([65, 66, 67, 68, 69])
}

it('test text_sensor converter', () => {
    let entity: Ientity = { id: 1, mqttname: "mqtt", converter: { name: "text_sensor", functionCodes: [] }, converterParameters: { stringlength: 10 }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    let sensorConverter = ConverterMap.getConverter(entity);

    let mqttValue = sensorConverter?.modbus2mqtt(spec, entity.id, r68);
    expect(mqttValue).toBe("ABCD");

    mqttValue = sensorConverter?.modbus2mqtt(spec, entity.id, r69);
    expect(mqttValue).toBe("ABCDE");

    expect(sensorConverter?.isReadOnly).toBeTruthy();
});

it('test value_sensor converter', () => {
    let entity: Ientity = { id: 1, mqttname: "mqtt", converter: { name: "value_sensor", functionCodes: [] }, converterParameters: { value: "testValue" }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    let sensorConverter = ConverterMap.getConverter(entity);
    let mqttValue = sensorConverter?.modbus2mqtt(spec, entity.id, { data: [], buffer: Buffer.from("") });
    expect(mqttValue).toBe("testValue");
    expect(sensorConverter?.isReadOnly).toBeTruthy();
});

it('test text converter', () => {
    let entity: Ientity = { id: 1, mqttname: "mqtt", converter: { name: "text", functionCodes: [] }, converterParameters: { stringlength: 10 }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    let converter = ConverterMap.getConverter(entity);
    let mqttValue = converter?.modbus2mqtt(spec, entity.id, r68);
    expect(mqttValue).toBe("ABCD");
    let modbusValue: any = converter!.mqtt2modbus(spec, entity.id, "ABCD")
    expect(modbusValue!.data).toEqual([65 << 8 | 66, 67 << 8 | 68]);
    modbusValue = converter!.mqtt2modbus(spec, entity.id, "ABCDE")
    expect(modbusValue!.data).toEqual([65 << 8 | 66, 67 << 8 | 68, 69 << 8]);
    expect(converter?.isReadOnly()).toBeFalsy();
});

it('test number converter', () => {
    let entity: Ientity = { id: 1, mqttname: "mqtt", converter: { name: "number", functionCodes: [] }, converterParameters: { multiplier: 0.01, offset: 0 }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    let converter = ConverterMap.getConverter(spec.entities[0]);
    let mqttValue = parseFloat(converter?.modbus2mqtt(spec, entity.id, getReadRegisterResult(6)) as string);
    expect(mqttValue).toBe(0.06);
    let modbusValue = converter?.mqtt2modbus(spec, entity.id, 0.07)
    // rounding is not relevant
    expect(Math.abs(modbusValue!.data[0] - 7)).toBeLessThan(0.00001);
    expect(converter?.isReadOnly()).toBeFalsy();

    entity = { id: 1, mqttname: "mqtt", converter: { name: "number", functionCodes: [] }, converterParameters: { multiplier: 0.01, offset: 20 }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    modbusValue = converter?.mqtt2modbus(spec, entity.id, 20.07)
    expect(Math.abs(modbusValue!.data[0] - 7)).toBeLessThan(0.00001);
    expect(converter?.isReadOnly()).toBeFalsy();

});
it('test select converter', () => {
    let entity: Ientity = { id: 1, mqttname: "mqtt", converter: { name: "select", functionCodes: [] }, converterParameters: { optionModbusValues: [1, 2] }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    let converter = ConverterMap.getConverter(entity);
    let modbusValue = converter?.mqtt2modbus(spec, entity.id, "test")
    expect(modbusValue!.data[0]).toBe(2);
    expect(converter?.isReadOnly()).toBeFalsy();
    entity = { id: 1, mqttname: "mqtt", converter: { name: "select", functionCodes: [] }, converterParameters: { optionModbusValues: [1, 2] }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    converter = ConverterMap.getConverter(entity);
    modbusValue = converter?.mqtt2modbus(spec, entity.id, "ON")
});
it('test button converter', () => {
    let entity: Ientity = { id: 1, mqttname: "mqtt", converter: { name: "button", functionCodes: [] }, functionCode: ModbusFunctionCodes.readWriteHoldingRegisters, modbusAddress: 2 }
    spec.entities = [entity]
    let converter = ConverterMap.getConverter(entity);
    let modbusValue = converter?.mqtt2modbus(spec, entity.id, "ON")
    expect(modbusValue!.data[0]).toBe(1);
    modbusValue = converter?.mqtt2modbus(spec, entity.id, "OFF")
    expect(modbusValue!.data[0]).toBe(0);
    expect(converter?.isReadOnly()).toBeFalsy();
});