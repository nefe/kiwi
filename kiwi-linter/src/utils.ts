/**
 * @author linhuiw
 * @desc 工具方法
 */
import * as _ from 'lodash';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * 将对象拍平
 * @param obj    原始对象
 * @param prefix
 */
export function flatten(obj, prefix?) {
  var propName = prefix ? prefix + '.' : '',
    ret = {};

  for (var attr in obj) {
    if (_.isArray(obj[attr])) {
      var len = obj[attr].length;
      ret[attr] = obj[attr].join(',');
    } else if (typeof obj[attr] === 'object') {
      _.extend(ret, flatten(obj[attr], propName + attr));
    } else {
      ret[propName + attr] = obj[attr];
    }
  }
  return ret;
}

/**
 * 查找当前位置的 Code
 */
export function findPositionInCode(text: string, code: string) {
  const lines = code.split('\n');
  const lineNum = lines.findIndex(line => line.includes(text));

  if (lineNum === -1) {
    return null;
  }

  let chNum = lines[lineNum].indexOf(text);

  if (text.startsWith(' ')) {
    chNum += 1;
  }

  return { lineNum, chNum };
}

export function findMatchKey(langObj, text) {
  for (const key in langObj) {
    if (langObj[key] === text) {
      return key;
    }
  }

  return null;
}


/**
 * 获取文件夹下所有文件
 * @function getAllFiles
 * @param  {string} dir Dir path string.
 * @return {string[]} Array with all file names that are inside the directory.
 */
export const getAllFiles = dir =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
  }, []);


/**
* 适配不同的语言文件夹位置
*/
export function dirAdaptor(rootPath) {
  const kiwiLangPerfix = `${rootPath}/.kiwi/zh-CN/`;
  const langPrefix = `${rootPath}/langs/zh-CN/`;

  /** 兼容 zh_CN 情况 */
  const _kiwiLangPerfix = `${rootPath}/.kiwi/zh_CN/`;
  const _langPrefix = `${rootPath}/langs/zh_CN/`;

  if (fs.existsSync(kiwiLangPerfix)) {
    return kiwiLangPerfix;
  } else if (fs.existsSync(langPrefix)) {
    return langPrefix;
  } else if (fs.existsSync(_kiwiLangPerfix)) {
    return _kiwiLangPerfix;
  } else if (fs.existsSync(_langPrefix)) {
    return _langPrefix;
  } else {
    const files = getAllFiles(`${rootPath}/`);
    const matchFiles = files.filter((fileName) => {
      if (fileName.includes('/.kiwi/zh-CN/index.ts')
        || fileName.includes('/langs/zh-CN/index.ts')
        || fileName.includes('/.kiwi/zh_CN/index.ts')
        || fileName.includes('/langs/zh_CN/index.ts')) {
        return true;
      }
      return false;
    });

    if (matchFiles.length) {
      return matchFiles[0].replace('index.ts', '');
    }
  }
}