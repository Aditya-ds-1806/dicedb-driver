/**
 * @generated
 * --------------------------------------------------------------
 * This file was automatically generated.
 * Source: build.ts
 * Date: 2025-05-12T18:27:01.617Z
 * 
 * ⚠️ DO NOT MODIFY THIS FILE MANUALLY ⚠️
 * Changes will be overwritten the next time it is built.
 * --------------------------------------------------------------
 */

import Command, { WatchableCommand } from "../lib/Command";
import { DiceDBResponse } from "../lib/Parsers";
import { COMMANDS } from "./constants/commands";

import DecrementCommand from './commands/Decrement';
import DecrementByCommand from './commands/DecrementBy';
import DeleteCommand from './commands/Delete';
import EchoCommand from './commands/Echo';
import ExistsCommand from './commands/Exists';
import ExpireCommand from './commands/Expire';
import ExpireAtCommand from './commands/ExpireAt';
import ExpireTimeCommand from './commands/ExpireTime';
import FlushDBCommand from './commands/FlushDB';
import GetCommand from './commands/Get';
import GetAndDeleteCommand from './commands/GetAndDelete';
import GetAndSetExpiryCommand from './commands/GetAndSetExpiry';
import GetSetCommand from './commands/GetSet';
import GetWatchCommand from './commands/GetWatch';
import HGetCommand from './commands/HGet';
import HGetAllCommand from './commands/HGetAll';
import HGetAllWatchCommand from './commands/HGetAllWatch';
import HGetWatchCommand from './commands/HGetWatch';
import HSetCommand from './commands/HSet';
import HandshakeCommand from './commands/Handshake';
import IncrementCommand from './commands/Increment';
import IncrementByCommand from './commands/IncrementBy';
import KeysCommand from './commands/Keys';
import PingCommand from './commands/Ping';
import SetCommand from './commands/Set';
import TTLCommand from './commands/TTL';
import TypeCommand from './commands/Type';
import UnwatchCommand from './commands/Unwatch';
import ZAddCommand from './commands/ZAdd';
import ZCardCommand from './commands/ZCard';
import ZCardWatchCommand from './commands/ZCardWatch';
import ZCountCommand from './commands/ZCount';
import ZCountWatchCommand from './commands/ZCountWatch';
import ZPopMaxCommand from './commands/ZPopMax';
import ZPopMinCommand from './commands/ZPopMin';
import ZRangeCommand from './commands/ZRange';
import ZRangeWatchCommand from './commands/ZRangeWatch';
import ZRankCommand from './commands/ZRank';
import ZRankWatchCommand from './commands/ZRankWatch';
import ZRemCommand from './commands/ZRem';

type ValueOf<T> = T[keyof T];

const commandRegistry = new Map<ValueOf<typeof COMMANDS>, typeof Command<DiceDBResponse> | typeof WatchableCommand>();

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
commandRegistry.set(GetSetCommand.command, GetSetCommand);
commandRegistry.set(GetWatchCommand.command, GetWatchCommand);
commandRegistry.set(HGetCommand.command, HGetCommand);
commandRegistry.set(HGetAllCommand.command, HGetAllCommand);
commandRegistry.set(HGetAllWatchCommand.command, HGetAllWatchCommand);
commandRegistry.set(HGetWatchCommand.command, HGetWatchCommand);
commandRegistry.set(HSetCommand.command, HSetCommand);
commandRegistry.set(HandshakeCommand.command, HandshakeCommand);
commandRegistry.set(IncrementCommand.command, IncrementCommand);
commandRegistry.set(IncrementByCommand.command, IncrementByCommand);
commandRegistry.set(KeysCommand.command, KeysCommand);
commandRegistry.set(PingCommand.command, PingCommand);
commandRegistry.set(SetCommand.command, SetCommand);
commandRegistry.set(TTLCommand.command, TTLCommand);
commandRegistry.set(TypeCommand.command, TypeCommand);
commandRegistry.set(UnwatchCommand.command, UnwatchCommand);
commandRegistry.set(ZAddCommand.command, ZAddCommand);
commandRegistry.set(ZCardCommand.command, ZCardCommand);
commandRegistry.set(ZCardWatchCommand.command, ZCardWatchCommand);
commandRegistry.set(ZCountCommand.command, ZCountCommand);
commandRegistry.set(ZCountWatchCommand.command, ZCountWatchCommand);
commandRegistry.set(ZPopMaxCommand.command, ZPopMaxCommand);
commandRegistry.set(ZPopMinCommand.command, ZPopMinCommand);
commandRegistry.set(ZRangeCommand.command, ZRangeCommand);
commandRegistry.set(ZRangeWatchCommand.command, ZRangeWatchCommand);
commandRegistry.set(ZRankCommand.command, ZRankCommand);
commandRegistry.set(ZRankWatchCommand.command, ZRankWatchCommand);
commandRegistry.set(ZRemCommand.command, ZRemCommand);

export default commandRegistry;
