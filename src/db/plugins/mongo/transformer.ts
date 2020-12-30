import { forOwn, isPlainObject } from 'lodash';

function transformIdKey(object: any) {
  if (object._id) {
    object.id = object._id;
    delete object._id;
  }
  forOwn(object, (val) => {
    if (isPlainObject(val)) {
      transformIdKey(val);
    }
  });
}

function hidePaths(object: any, paths: string[]) {
  paths.forEach(function (path) {
    if (object[path]) {
      delete object[path];
    }
  });
}

export default function transformerPlugin(schema: any) {
  let pathsToHide = schema.options.hide ? schema.options.hide : [];

  if (typeof pathsToHide === 'string') {
    pathsToHide = pathsToHide.split(' ');
    if (pathsToHide.length === 1) {
      pathsToHide = pathsToHide[0];
    }
  }

  if (typeof pathsToHide === 'string') {
    pathsToHide = pathsToHide.split(',');
  }

  if (!schema.options.toObject) {
    schema.options.toObject = { virtuals: true, versionKey: false };
  }

  if (!schema.options.toJSON) {
    schema.options.toJSON = { virtuals: true, versionKey: false };
  }

  function transform(doc: any, ret: any, options: any) {
    transformIdKey(ret);
    if (!options.showAll) {
      hidePaths(ret, pathsToHide);
    }
    return ret;
  }

  schema.options.toJSON.transform = transform;

  schema.options.toObject.transform = transform;
}
