import { ConfirmQuestion, ListQuestion } from "inquirer";
import { ICommon } from "./Scripts/ICommon";

export interface IProjectType {
	cli: {
		projectType: string
	}
}

export interface IText {
	moleculer: string;
	nextjs: string;
	[key: string]: string;
}

export interface IQuestions {
	moleculer: ListQuestion<ICommon.IAnswers>;
	nextjs: ListQuestion<ICommon.IAnswers>;
	[key: string]: ListQuestion<ICommon.IAnswers>;
}

export interface IQuestionsHelper {
	default: {
		showQuestions: Function
	}
}
