import fs from 'node:fs/promises';
import path from 'node:path';
import ts, { Project, SyntaxKind, Node } from 'ts-morph';
import { COMMAND_TO_COMMAND_NAME } from '../src/constants/commands';

const project = new Project({
    tsConfigFilePath: './tsconfig.json'
});

const COMMANDS_DIR = path.resolve(import.meta.dirname, '../src/commands');
const INDEX_FILE_PATH = path.resolve(import.meta.dirname, '../index.ts');
const REGISTRY_FILE_PATH = path.resolve(import.meta.dirname, '../src/registry.ts');

const files = await fs.readdir(COMMANDS_DIR);

function buildIndexFileString() {
    let diceDBString = 'class DiceDB extends DiceDBBase {\n';
    const header = `/**
 * @generated
 * --------------------------------------------------------------
 * This file was automatically generated.
 * Source: build.ts
 * Date: ${new Date().toISOString()}
 * 
 * ⚠️ DO NOT MODIFY THIS FILE MANUALLY ⚠️
 * Changes will be overwritten the next time it is built.
 * --------------------------------------------------------------
 */`;

    let imports = 'import { Readable } from "stream";\n\n';
    imports += 'import DiceDBBase, { type DiceDBOptions } from "./src/dicedb";\n';
    imports += 'import { ParsedResponse } from "./lib/Parsers";\n';
    
    for (const file of files) {
        const fileName = file.replace('.ts', '');
        const className = `${fileName}Command`;
        const commandFile = project.getSourceFileOrThrow(`src/commands/${file}`);
        const commandClass = commandFile.getClass(className);
        const execMethod = commandClass?.getMethodOrThrow('exec');
        const commandGetter = commandClass?.getStaticMembers()?.find(member => member.getName() === 'command' && member.getKind() === SyntaxKind.GetAccessor);

        const params: string[] = [];
        const paramsWithType = execMethod?.getSignature()?.getParameters()?.map(p => {
            const declarations = p.getDeclarations();
            const decl = declarations.find(Node.isParameterDeclaration);
            const isRest = decl?.isRestParameter() ?? false;

            params.push(`${isRest ? '...' : ''}${p.getName()}`);

            return `${isRest ? '...' : ''}${p.getName()}: ${p.getTypeAtLocation(execMethod!).getText(undefined, ts.TypeFormatFlags.None)}`;
        })?.join(', ');

        const commandName = commandGetter?.getType()?.getText()?.replaceAll('"', '') as keyof typeof COMMAND_TO_COMMAND_NAME;
        const execReturnType = execMethod?.getReturnType()?.getText(undefined, ts.TypeFormatFlags.None);

        diceDBString += `\tasync ${COMMAND_TO_COMMAND_NAME[commandName]}(${paramsWithType}) {\n`;
        diceDBString += `\t\treturn this.execCommand('${commandName}', ${params.join(', ')}) as ${execReturnType};\n`;
        diceDBString += `\t}\n\n`;

        const interfaces = commandFile.getInterfaces().filter(i => i.isExported()).map(i => i.getName());

        if (interfaces.length) {
            imports += `import { ${interfaces?.join(', ')} } from './src/commands/${fileName}';\n`;
        }
    }

    diceDBString += '}\n';

    const exports = 'export { DiceDB as default, type DiceDBOptions };'
    const indexFileString = `${header}\n\n${imports}\n${diceDBString}\n${exports}`

    return indexFileString;
}

function buildRegistryFileString() {
    const header = `/**
 * @generated
 * --------------------------------------------------------------
 * This file was automatically generated.
 * Source: build.ts
 * Date: ${new Date().toISOString()}
 * 
 * ⚠️ DO NOT MODIFY THIS FILE MANUALLY ⚠️
 * Changes will be overwritten the next time it is built.
 * --------------------------------------------------------------
 */`;

    let registryString = '';
    let cmdRegistry = `type ValueOf<T> = T[keyof T];\n\n`;
    let imports = 'import Command, { WatchableCommand } from "../lib/Command";\n';
    
    imports += 'import { ParsedResponse } from "../lib/Parsers";\n';
    imports += 'import { COMMANDS } from "./constants/commands";\n\n';

    cmdRegistry += 'const commandRegistry = new Map<ValueOf<typeof COMMANDS>, typeof Command<ParsedResponse> | typeof WatchableCommand>();\n';

    for (const file of files) {
        const fileName = file.replace('.ts', '');
        const CommandName = `${fileName}Command`;

        imports += `import ${CommandName} from './commands/${fileName}';\n`;
        registryString += `commandRegistry.set(${CommandName}.command, ${CommandName});\n`;
    }

    const exports = 'export default commandRegistry;';

    const registryFileString = `${header}\n\n${imports}\n${cmdRegistry}\n${registryString}\n${exports}\n`;
    return registryFileString;
}

const indexFileString = buildIndexFileString();
const registryFileString = buildRegistryFileString();

await fs.writeFile(INDEX_FILE_PATH, indexFileString);
await fs.writeFile(REGISTRY_FILE_PATH, registryFileString);
