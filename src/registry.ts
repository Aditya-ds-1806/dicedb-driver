import Command, { WatchableCommand } from "../lib/Command";
import { ParsedResponse } from "../lib/Parsers";

import DecrementCommand from "./commands/Decrement";
import DecrementByCommand from "./commands/DecrementBy";
import DeleteCommand from "./commands/Delete";
import EchoCommand from "./commands/Echo";
import ExistsCommand from "./commands/Exists";
import ExpireCommand from "./commands/Expire";
import ExpireAtCommand from "./commands/ExpireAt";
import ExpireTimeCommand from "./commands/ExpireTime";
import FlushDBCommand from "./commands/FlushDB";
import GetCommand from "./commands/Get";
import GetAndDeleteCommand from "./commands/GetAndDelete";
import GetAndSetExpiryCommand from "./commands/GetAndSetExpiry";
import GetWatchCommand from "./commands/GetWatch";
import HandshakeCommand from "./commands/Handshake";
import IncrementCommand from "./commands/Increment";
import IncrementByCommand from "./commands/IncrementBy";
import PingCommand from "./commands/Ping";
import SetCommand from "./commands/Set";
import TTLCommand from "./commands/TTL";
import TypeCommand from "./commands/Type";
import UnwatchCommand from "./commands/Unwatch";
import { COMMANDS } from "./constants/commands";

type ValueOf<T> = T[keyof T];

const commandRegistry = new Map<ValueOf<typeof COMMANDS>, typeof Command<ParsedResponse> | typeof WatchableCommand>();

commandRegistry.set(DecrementCommand.command, DecrementCommand);
commandRegistry.set(DecrementByCommand.command, DecrementByCommand);
commandRegistry.set(DeleteCommand.command, DeleteCommand);
commandRegistry.set(EchoCommand.command, EchoCommand);
commandRegistry.set(ExistsCommand.command, ExistsCommand);
commandRegistry.set(ExpireCommand.command, ExpireCommand);
commandRegistry.set(ExpireAtCommand.command, ExpireAtCommand);
commandRegistry.set(ExpireTimeCommand.command, ExpireTimeCommand);
commandRegistry.set(FlushDBCommand.command, FlushDBCommand);
commandRegistry.set(GetCommand.command, GetCommand);
commandRegistry.set(GetAndDeleteCommand.command, GetAndDeleteCommand);
commandRegistry.set(GetAndSetExpiryCommand.command, GetAndSetExpiryCommand);
commandRegistry.set(GetWatchCommand.command, GetWatchCommand);
commandRegistry.set(HandshakeCommand.command, HandshakeCommand);
commandRegistry.set(IncrementCommand.command, IncrementCommand);
commandRegistry.set(IncrementByCommand.command, IncrementByCommand);
commandRegistry.set(PingCommand.command, PingCommand);
commandRegistry.set(SetCommand.command, SetCommand);
commandRegistry.set(TTLCommand.command, TTLCommand);
commandRegistry.set(TypeCommand.command, TypeCommand);
commandRegistry.set(UnwatchCommand.command, UnwatchCommand);

export default commandRegistry;
