// #region Global Imports
import * as fs from 'fs';
import * as path from 'path';
// #endregion Global Imports

// #region Local Imports
import { Config } from '../../config';
import * as params from './nextjs2.config';
import { CommonHelper } from '../Common';
import { ICommon } from '../ICommon';
import { INextjs2Helper } from './INextjs2Types';
// #endregion Local Imports

export const Helper = {
    addRoute: (
        answers: ICommon.IAnswers,
        IAddRoutesReplaceParams: INextjs2Helper.IAddRoutesReplaceParams
    ) => {
        const { hasPath, routePath, fileName } = answers;

        const templateProps = {
            fileName: fileName.replace(/\b\w/g, foo => foo.toLowerCase()),
            hasPath,
            routePath
        };

        const replaceContentParams: ICommon.IReplaceContent = {
            fileDir: IAddRoutesReplaceParams.routesDir,
            filetoUpdate: fs.readFileSync(
                path.resolve('', IAddRoutesReplaceParams.routesDir),
                'utf8'
            ),
            getFileContent: () =>
                CommonHelper.getTemplate(IAddRoutesReplaceParams.routesTemplate, templateProps),
            message: `Route added to routes.ts as ${
                hasPath ? `'/${routePath}'` : `'/${fileName}/index'`
            }`,
            regexKey: /^(?:[\t ]*(?:\r?\n|\r))+export default routes;/gm
        };

        CommonHelper.replaceContent(replaceContentParams);
    },
    createInterface: (options: ICommon.IAnswers) => {
        const {
            fileName,
            lowerFileName,
            isPage,
            isConnectStore,
            isFuncComponent,
            upperFileName,
            isClass = !!options.classDir
        } = options;

        const {
            interfaceDir,
            pageInterfaceIndex,
            pageInterfaceDir,
            componentsDir,
            compInterfaceDir,
            templatePath,
            reduxInterfaceDir,
            storeImportInterface,
            storeInterface
        } = params.createInterfaceParams;

        const pageDirPath = `${pageInterfaceDir}/${fileName}.d.ts`;
        let compDirPath;

        if (isFuncComponent) {
            compDirPath = `${componentsDir}/${fileName}/${fileName}.d.ts`;
        } else {
            compDirPath = `${compInterfaceDir}/${fileName}.d.ts`;
        }

        const writeFileProps: ICommon.IWriteFile = {
            dirPath: isPage ? pageDirPath : compDirPath,
            getFileContent: () => CommonHelper.getTemplate(templatePath, options),
            message: 'Added new interface file'
        };

        const commonReplaceParams = (contentFile: string, message: string, regexKey: RegExp) => ({
            fileDir: reduxInterfaceDir,
            filetoUpdate: fs.readFileSync(path.resolve('', reduxInterfaceDir), 'utf8'),
            getFileContent: () => CommonHelper.getTemplate(contentFile, options),
            message,
            regexKey
        });

        CommonHelper.writeFile(writeFileProps);

        if (isPage) {
            const replaceContentParams: ICommon.IReplaceContent = {
                fileDir: interfaceDir,
                filetoUpdate: fs.readFileSync(path.resolve('', interfaceDir), 'utf8'),
                getFileContent: () => CommonHelper.getTemplate(pageInterfaceIndex, options),
                message: 'Interface file added to Interfaces/index.ts',
                regexKey: /\/\/ #region Page Interfaces/g
            };

            CommonHelper.replaceContent(replaceContentParams);
        }

        if (isConnectStore) {
            const replaceStoreParams: ICommon.IReplaceContent = commonReplaceParams(
                storeInterface,
                'Interface file added to Redux/IStore.d.ts',
                /export interface IStore\s[{]/g
            );

            CommonHelper.replaceContent(replaceStoreParams);

            setTimeout(() => {
                const replaceStoreImportParams: ICommon.IReplaceContent = commonReplaceParams(
                    storeImportInterface,
                    'Interface file added to import section in Redux/IStore.d.ts',
                    /\s[}] from "@Interfaces";/g
                );

                CommonHelper.replaceContent(replaceStoreImportParams);
            }, 100);
        }
    },

    createStyle: (
        answers: ICommon.IAnswers,
        createStyleParams: INextjs2Helper.ICreateStyle
    ): void => {
        const { fileName, isPage, lowerFileName } = answers;

        const {
            isStyledComponent,
            pageDirPath,
            compDirPath,
            pageStyledDirPath,
            templatePath
        } = createStyleParams;

        const templateProps = { fileName, lowerFileName };

        let _compDirPath;

        let _pageDirPath;

        if (isStyledComponent) {
            _compDirPath = `${compDirPath}/${answers.fileName}/styled.ts`;
            _pageDirPath =
                `${pageStyledDirPath}/${answers.fileName.replace(/\b\w/g, foo =>
                    foo.toUpperCase()
                )}.ts` || '';
        } else {
            _compDirPath = `${compDirPath}/${answers.fileName}/style.scss`;
            _pageDirPath = `${pageDirPath}/${answers.fileName.replace(/\b\w/g, foo =>
                foo.toLowerCase()
            )}/style.scss`;
        }

        const writeFileProps = {
            dirPath: isPage ? _pageDirPath : _compDirPath,
            getFileContent: () => CommonHelper.getTemplate(templatePath, templateProps),
            message: 'Added new style file'
        };

        CommonHelper.writeFile(writeFileProps);
    },

    addActionConstIndex: (
        templateProps: ICommon.ITemplateProps,
        params: INextjs2Helper.IAddActionConstIndexParams
    ): void => {
        const { actionConstTemplatePath, actionConstsFileDir } = params;

        const replaceContentParams: ICommon.IReplaceContent = {
            fileDir: actionConstsFileDir,
            filetoUpdate: fs.readFileSync(path.resolve('', actionConstsFileDir), 'utf8'),
            getFileContent: () => CommonHelper.getTemplate(actionConstTemplatePath, templateProps),
            message: 'Action constants added to Definitions/ActionConsts/ActionConsts.ts',
            regexKey: /export const ActionConsts\s[=]\s[{]/g
        };

        CommonHelper.replaceContent(replaceContentParams);
    },

    addAction: (answers: ICommon.IAnswers, params: INextjs2Helper.IAddActionParams): void => {
        const { actionIndexTemplatePath, actionTemplatePath, actionTestTemplatePath } = params;
        const { fileName, lowerFileName } = answers;
        const actionFolderDir = `${Config.nextjs2.actionDir}/${fileName}Actions`;
        const actionFileDir = `${actionFolderDir}/index.ts`;
        const testFileDir = `${actionFolderDir}/index.spec.ts`;
        const templateProps = { fileName, lowerFileName };

        const writeFileProps: ICommon.IWriteFile = {
            dirPath: actionFileDir,
            getFileContent: () => CommonHelper.getTemplate(actionTemplatePath, templateProps),
            message: 'Added new action file'
        };

        const addIndexParams: ICommon.IAddIndex = {
            dirPath: `${Config.nextjs2.actionDir}/index.ts`,
            getFileContent: () => CommonHelper.getTemplate(actionIndexTemplatePath, templateProps),
            message: 'Added action file to index.ts Actions/index.ts'
        };

        const addTestParams: ICommon.IAddTest = {
            dirPath: testFileDir,
            getFileContent: () => CommonHelper.getTemplate(actionTestTemplatePath, templateProps),
            message: 'Added action test'
        };

        CommonHelper.createFile(actionFolderDir);
        CommonHelper.addToIndex(addIndexParams);
        CommonHelper.writeFile(writeFileProps);
        CommonHelper.writeFile(addTestParams);
    },

    addReducer: (answers: ICommon.IAnswers, params: INextjs2Helper.IAddReducerParams): void => {
        const {
            reducerIndexTemplatePath,
            reducerTemplatePath,
            addActionConstIndexParams,
            reducerStoreTemplatePath,
            reducerTestTemplatePath
        } = params;

        const { fileName, lowerFileName, isConnectStore, upperFileName } = answers;

        const reducerFolderDir = `${Config.nextjs2.reducerDir}/${lowerFileName}`;
        const reducerFileDir = `${reducerFolderDir}/index.ts`;
        const templateProps = { fileName, lowerFileName, upperFileName };
        const replaceContentParams: ICommon.IReplaceContent = {
            fileDir: `${Config.nextjs2.reducerDir}/index.ts`,
            filetoUpdate: fs.readFileSync(
                path.resolve('', `${Config.nextjs2.reducerDir}/index.ts`),
                'utf8'
            ),
            getFileContent: () => CommonHelper.getTemplate(reducerIndexTemplatePath, templateProps),
            message: 'Reducer added to Redux/Reducers/index.ts',
            regexKey: /\/\/ #endregion Local Imports/g
        };

        const testFileDir = `${reducerFolderDir}/index.spec.ts`;
        const addTestParams: ICommon.IAddTest = {
            dirPath: testFileDir,
            getFileContent: () => CommonHelper.getTemplate(reducerTestTemplatePath, templateProps),
            message: 'Added reducer test'
        };

        const writeFileProps: ICommon.IWriteFile = {
            dirPath: reducerFileDir,
            getFileContent: () => CommonHelper.getTemplate(reducerTemplatePath, templateProps),
            message: 'Added new reducer file'
        };

        CommonHelper.createFile(reducerFolderDir);
        CommonHelper.writeFile(writeFileProps);
        CommonHelper.replaceContent(replaceContentParams);
        CommonHelper.writeFile(addTestParams);

        setTimeout(() => {
            const replaceReducerContentParams: ICommon.IReplaceContent = {
                fileDir: `${Config.nextjs2.reducerDir}/index.ts`,
                filetoUpdate: fs.readFileSync(
                    path.resolve('', `${Config.nextjs2.reducerDir}/index.ts`),
                    'utf8'
                ),
                getFileContent: () =>
                    CommonHelper.getTemplate(reducerStoreTemplatePath, templateProps),
                message: 'Reducer file added combineReducers in Redux/Reducers/index.ts',
                regexKey: /export default combineReducers[(][{]/g
            };
            CommonHelper.replaceContent(replaceReducerContentParams);
        }, 100);

        if (isConnectStore) {
            Helper.addActionConstIndex(templateProps, addActionConstIndexParams);
        }
    },

    createClassComponent: (options: ICommon.IAnswers): void => {
        const {
            templatePath,
            indexTemplatePath,
            addReducerParams,
            addActionParams
        } = params.createClassComponentParams;

        const { lowerFileName, isConnectStore, isPage, hasPath } = options;

        const addIndexParams: ICommon.IAddIndex = {
            dirPath: `${Config.nextjs2.componentsDir}/index.ts`,
            getFileContent: () => CommonHelper.getTemplate(indexTemplatePath, options),
            message: 'Component added to index.ts'
        };

        const writeFileProps: ICommon.IWriteFile = {
            dirPath: `${options.classDir}/index.tsx`,
            getFileContent: () => CommonHelper.getTemplate(templatePath, options),
            message: 'Added new class component'
        };

        if (isPage) {
            options.classDir = `${Config.nextjs2.pagesDir}/${lowerFileName}`;

            const addRouteParams = {
                routesDir: Config.nextjs2.routesDir,
                routesTemplate: Config.nextjs2.templates.addRouteTemplate
            };

            hasPath && Helper.addRoute(options, addRouteParams);
        } else {
            options.classDir = `${Config.nextjs2.componentsDir}/${options.fileName}`;
            CommonHelper.addToIndex(addIndexParams);
        }

        CommonHelper.createFile(options.classDir);
        CommonHelper.writeFile(writeFileProps);
        Helper.createInterface(options);

        if (isConnectStore) {
            Helper.addReducer(options, addReducerParams);
            Helper.addAction(options, addActionParams);
        }

        switch (options.hasStyle) {
            case 'styled':
                options.isStyled = true;
                Helper.createStyle(options, params.createStyledComponentParams);
                break;
            case 'scss':
                options.isScss = true;
                Helper.createStyle(options, params.createStyleParams);
                break;
            default:
                break;
        }
    },

    createFuncComponent: (options: ICommon.IAnswers): void => {
        const { lowerFileName, fileName, hasStyle, isScss } = options;

        switch (hasStyle) {
            case 'styled':
                options.isStyled = true;
                options.params = params.createStyledFuncComponentParams;
                Helper.createStyle(options, params.createStyledComponentParams);
                break;
            case 'scss':
                options.isScss = true;
                options.params = params.createFuncComponentParams;
                Helper.createStyle(options, params.createStyleParams);
                break;
            default:
                break;
        }

        const {
            componentsDir,
            templatePath,
            indexTemplatePath,
            componentTestTemplatePath
        } = options.params;

        const funcComponentDir = `${componentsDir}/${fileName}`;

        const templateProps = {
            fileName,
            isScss,
            lowerFileName
        };

        const addIndexParams: ICommon.IAddIndex = {
            dirPath: `${componentsDir}/index.ts`,
            getFileContent: () => CommonHelper.getTemplate(indexTemplatePath, templateProps),
            message: 'Component added to index.ts.'
        };

        const writeFileProps: ICommon.IWriteFile = {
            dirPath: `${funcComponentDir}/index.tsx`,
            getFileContent: () => CommonHelper.getTemplate(templatePath, templateProps),
            message: 'Added new functional component.'
        };

        const writeTestFileProps: ICommon.IWriteFile = {
            dirPath: `${funcComponentDir}/index.spec.tsx`,
            getFileContent: () =>
                CommonHelper.getTemplate(componentTestTemplatePath, templateProps),
            message: 'Added unit test of component.'
        };

        CommonHelper.createFile(funcComponentDir);
        CommonHelper.writeFile(writeFileProps);
        CommonHelper.writeFile(writeTestFileProps);
        CommonHelper.addToIndex(addIndexParams);
        Helper.createInterface(options);
    }
};
