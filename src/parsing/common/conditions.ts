import { PrintItemKind, Info, Condition, Signal, PrintItemIterator } from "../../types";
import { BaseContext } from "./BaseContext";
import * as conditionResolvers from "./conditionResolvers";
import { RepeatableIterator } from "../../utils";
import { withIndent } from "./parserHelpers";

// reusable conditions

export function newlineIfHangingSpaceOtherwise(
    context: BaseContext,
    startInfo: Info,
    endInfo?: Info,
    spaceChar: " " | Signal.SpaceOrNewLine = " "
): Condition {
    return {
        kind: PrintItemKind.Condition,
        name: "newLineIfHangingSpaceOtherwise",
        condition: conditionContext => {
            return conditionResolvers.isHanging(conditionContext, startInfo, endInfo);
        },
        true: [context.newlineKind],
        false: [spaceChar]
    };
}

export function newlineIfMultipleLinesSpaceOrNewlineOtherwise(
    context: BaseContext,
    startInfo: Info,
    endInfo?: Info
): Condition {
    return {
        name: "newlineIfMultipleLinesSpaceOrNewlineOtherwise",
        kind: PrintItemKind.Condition,
        condition: conditionContext => conditionResolvers.isMultipleLines(conditionContext, startInfo, endInfo || conditionContext.writerInfo, false),
        true: [context.newlineKind],
        false: [Signal.SpaceOrNewLine]
    };
}

export function singleIndentIfStartOfLine(): Condition {
    return {
        kind: PrintItemKind.Condition,
        name: "singleIndentIfStartOfLine",
        condition: conditionResolvers.isStartOfNewLine,
        true: [Signal.SingleIndent]
    };
}

export function* indentIfStartOfLine(item: PrintItemIterator): PrintItemIterator {
    // need to make this a repeatable iterator so it can be iterated multiple times
    // between the true and false condition
    item = new RepeatableIterator(item);

    yield {
        kind: PrintItemKind.Condition,
        name: "indentIfStartOfLine",
        condition: conditionResolvers.isStartOfNewLine,
        true: withIndent(item),
        false: item
    };
}

export function* withIndentIfStartOfLineIndented(item: PrintItemIterator): PrintItemIterator {
    // need to make this a repeatable iterator so it can be iterated multiple times
    // between the true and false condition
    item = new RepeatableIterator(item);

    yield {
        kind: PrintItemKind.Condition,
        name: "withIndentIfStartOfLineIndented",
        condition: context => {
            return context.writerInfo.lineStartIndentLevel > context.writerInfo.indentLevel;
        },
        true: withIndent(item),
        false: item
    };
}

/**
 * This condition can be used to force the printer to jump back to the point
 * this condition exists at once the provided info is resolved.
 * @param info - Info to force reevaluation once resolved.
 */
export function forceReevaluationOnceResolved(info: Info): Condition {
    return {
        kind: PrintItemKind.Condition,
        name: "forceReevaluationOnceInfoResolved",
        condition: conditionContext => {
            return conditionContext.getResolvedInfo(info) == null ? undefined : false;
        }
    };
}