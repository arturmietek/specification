import { file } from "jszip";
import { IModbusData, IfileSpecification } from "./ifilespecification";
import { ModbusRegisterType, SPECIFICATION_VERSION } from "specification.shared";
import {LogLevelEnum, Logger} from "./log"
import { ImodbusValues, emptyModbusValues } from "./m2mspecification";
let log = new Logger("migrator")

enum ModbusFunctionCodes0_1 {
    readHoldingRegisters = 3,
    readCoils = 1,
    readAnalogInputs = 4,
    writeCoils = 15,
    writeAnalogOutput = 6,
    readWriteHoldingRegisters = 21,
    readAnalogs = 22,
    readWriteCoils = 20,
    writeHoldingRegisters = 16,
    IllegalFunctionCode = 0
}
var FCOffset0_1: number = 100000
export class Migrator {
  constructor(){}
  migrate(filecontent:any):IfileSpecification {
    let rc:IfileSpecification
    
    log.log(LogLevelEnum.notice, "Migration:" + filecontent.version)
    if(filecontent.version != undefined)
    switch(filecontent.version){
        case "0.1":
            return this.migrate0_1to0_2(filecontent)
            
            break;
            case SPECIFICATION_VERSION:
                return filecontent
        default:
           log.log(LogLevelEnum.error , "Migration: Specification Version " + filecontent.version + " is unknown") 
           throw new Error("Specification Version " + filecontent.version + " is unknown");
    }
    
    return filecontent;
  }
  private fc2registerType(functioncode:number):{ registerType:ModbusRegisterType, readonly:boolean}|undefined
  {
    switch(functioncode ){
    case ModbusFunctionCodes0_1.readHoldingRegisters:
        return {registerType: ModbusRegisterType.HoldingRegister,
                  readonly: true}
     case ModbusFunctionCodes0_1.readCoils:
        return {registerType: ModbusRegisterType.Coils,
        readonly: true}
     case ModbusFunctionCodes0_1.readAnalogInputs:
        return {registerType: ModbusRegisterType.AnalogInputs,
        readonly: true}
    case ModbusFunctionCodes0_1.writeCoils:
        return {registerType: ModbusRegisterType.Coils,
        readonly: false}
       break;
    case ModbusFunctionCodes0_1.writeAnalogOutput:
        return {registerType: ModbusRegisterType.AnalogInputs,
        readonly: false}
       break;
    case ModbusFunctionCodes0_1.readWriteHoldingRegisters:
        return {registerType: ModbusRegisterType.HoldingRegister,
        readonly: false}
        break;
    case ModbusFunctionCodes0_1.readAnalogs :
        return {registerType: ModbusRegisterType.AnalogInputs,
        readonly: true}
        break;
    case ModbusFunctionCodes0_1.readWriteCoils:
        return {registerType: ModbusRegisterType.Coils,
        readonly: false}
        break;
    case ModbusFunctionCodes0_1.writeHoldingRegisters:
        return {registerType: ModbusRegisterType.HoldingRegister,
        readonly: false}
        break;
    case ModbusFunctionCodes0_1.IllegalFunctionCode:
        log.log(LogLevelEnum.error , "Function Code" + functioncode + " is unknown") 
 }
return undefined;

  }
  
  migrate0_1to0_2(filecontent: any):IfileSpecification {
    filecontent.version = SPECIFICATION_VERSION
    // functioncode to registerType
    if(filecontent.entities)
    filecontent.entities.forEach( (entity:any)=>{
        delete entity.converter.functionCodes
        entity.converter.name= this.getConvertername0_1( entity.converter.name)
        entity.converter.registerTypes=[]
        let rt= this.fc2registerType(entity.functionCode)
        if( rt){
             entity.registerType = rt.registerType
             entity.readonly = rt.readonly
             delete entity.functionCode
        }
           
    })
    let td:IModbusData = {
            coils:[],
            analogInputs: [],
            holdingRegisters: []
        }
    if( filecontent.testdata){
        
        filecontent.testdata.forEach( (data:any)=>{
            let fc = Math.floor(data.address/FCOffset0_1)
            let address = data.address % FCOffset0_1
            let value = data.value
            let rt = this.fc2registerType(fc)
            if(rt)
            switch( rt.registerType){
                case ModbusRegisterType.AnalogInputs:
                    td.analogInputs!.push({address:address, value:value})
                    break;
                case ModbusRegisterType.HoldingRegister:
                    td.holdingRegisters!.push({address:address, value:value})
                    break;
                case ModbusRegisterType.Coils:
                    td.coils!.push({address:address, value:value})
                break;
            }
        })
     }
     if ( td.analogInputs!.length == 0 )
        delete td.analogInputs
     if ( td.holdingRegisters!.length == 0 )
        delete td.holdingRegisters
     if ( td.coils!.length == 0 )
        delete td.coils
    
    filecontent.testdata = td
  
    return filecontent;
  }
    getConvertername0_1(converter: string):string {
       switch(converter){
        case  "sensor" : return "number";

        case  "number" :
        case "select" :
        case "text" :
        case "button" :
        case "value": return converter;
        
        case "text_sensor":
        case "select_sensor":
        case "binary_sensor" :         
        case "value_sensor" : 
        return converter.replaceAll("_sensor","")

       }
       log.log(LogLevelEnum.error, "Unable to convert converter to registerType " + converter)
       return converter;
    }
}


