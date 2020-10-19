import mongoose from 'mongoose';
import validator from 'validator';
import { randomString } from '../utils/randomization';
import { GraphQLSchema } from '../graphql';

const { Schema: MongooseSchema } = mongoose;

function findDatabaseDirective(directives: any): any {
  const directive = directives.find((row: any) => row.name.value === 'database');

  if (!directive) {
    return null;
  }

  if (directive.value && directive.value.value) {
    return directive.value.value;
  }

  return 'default';
}

function findUniqueDirective(directives: any): any {
  return !!directives.find((row: any) => row.name.value === 'unique');
}

function findVirtualDirective(directives: any): any {
  return !!directives.find((row: any) => row.name.value === 'virtual');
}

function findLocalizedDirective(directives: any): any {
  return !!directives.find((row: any) => row.name.value === 'localized');
}

function findLengthDirective(directives: any): any {
  const directive = directives.find((row: any) => row.name.value === 'length');
  const result: any = {
    maxlength: undefined,
    minlength: undefined,
  };
  if (directive) {
    const maxArgument = directive.arguments.find((argument: any) => argument.name.value === 'max');
    if (maxArgument) {
      result.maxlength = parseInt(maxArgument.value.value, 10);
    }
    const minArgument = directive.arguments.find((argument: any) => argument.name.value === 'min');
    if (minArgument) {
      result.minlength = parseInt(minArgument.value.value, 10);
    }
  }

  return result;
}

function findRandomDirective(directives: any): string | void {
  const directive = directives.find((row: any) => row.name.value === 'randomString');
  if (!directive) {
    return undefined;
  }

  const {
    value: { value: length },
  } = directive.arguments.find((r: any) => r.name.value === 'length') || { value: {} };
  const {
    value: { value: charset },
  } = directive.arguments.find((r: any) => r.name.value === 'charset') || { value: {} };

  return randomString(length, charset);
}

function findDefaultDirective(directives: any): any {
  const directive = directives.find((row: any) => row.name.value === 'default');
  if (!directive) {
    return findRandomDirective(directives);
  }
  return directive.arguments[0].value.value;
}

function findNowDirective(directives: any): any {
  const directive = directives.find((row: any) => row.name.value === 'now');
  if (!directive) {
    return undefined;
  }
  return Date.now;
}

function hasDatabase(type: any): boolean {
  if (!type.astNode || type.astNode.kind !== 'ObjectTypeDefinition') {
    return false;
  }
  if (type.astNode && findDatabaseDirective(type.astNode.directives)) {
    return true;
  }

  return (
    type.extensionASTNodes &&
    type.extensionASTNodes.filter((node: any) => findDatabaseDirective(node.directives)).length
  );
}

function parseObjectDefinition(type: any) {
  return makeModel(type.toConfig());
}

function parseFieldTypeDefinition(definition: any, type: any) {
  let definitionType = definition.type;
  let graphQLType = type;
  let mongooseType: any;
  const field: any = {};

  const unique = findUniqueDirective(definition.directives || []);
  if (unique) {
    field.unique = true;
  }

  const localized = findLocalizedDirective(definition.directives || []);
  if (localized) {
    field.localized = true;
  }

  let defaultValue = findDefaultDirective(definition.directives || []);

  if (definitionType.kind === 'ListType') {
    graphQLType = type.ofType;
  } else if (definitionType.kind === 'NonNullType') {
    field.required = true;
    graphQLType = type.ofType;
  }

  if (graphQLType.constructor.name === 'GraphQLScalarType') {
    const graphQLTypeString = graphQLType.toString();
    switch (graphQLTypeString) {
      case 'Int':
        mongooseType = MongooseSchema.Types.Number;
        break;
      case 'Phone':
      case 'Email':
        field.lowercase = true;
        field.trim = true;
        field.validate = [validator.isEmail, `Invalid email format`];
      case 'String':
        mongooseType = MongooseSchema.Types.String;
        const { minlength, maxlength } = findLengthDirective(definition.directives || []);
        Object.assign(field, { minlength, maxlength });
        break;
      case 'Boolean':
        mongooseType = MongooseSchema.Types.Boolean;
        break;
      case 'Date':
        mongooseType = MongooseSchema.Types.Date;
        defaultValue = findNowDirective(definition.directives);
        break;
      default:
        mongooseType = MongooseSchema.Types.Mixed;
    }
    if (definitionType.kind === 'ListType') {
      field.type = [mongooseType];
    } else {
      field.type = mongooseType;
    }
  } else if (graphQLType.constructor.name === 'GraphQLEnumType') {
    const enumValues = graphQLType.astNode.values.map((r: any) => r.name.value);
    if (definitionType.kind === 'ListType') {
      field.type = [{ type: 'String', enum: enumValues }];
    } else {
      field.type = 'String';
      field.enum = enumValues;
    }
  } else if (graphQLType.constructor.name === 'GraphQLObjectType') {
    if (hasDatabase(graphQLType)) {
      const inferredType = {
        type: MongooseSchema.Types.ObjectId,
        ref: graphQLType.toString(),
      };

      if (definitionType.kind === 'ListType') {
        field.type = [inferredType];
      } else {
        Object.assign(field, { ...inferredType });
      }
    } else {
      const nestedType = parseObjectDefinition(graphQLType);
      if (definitionType.kind === 'ListType') {
        field.type = [nestedType];
      } else {
        field.type = nestedType;
      }
    }
  } else {
    throw new Error(`COULD NOT PARSE: ${graphQLType.toString()}`);
  }

  if (defaultValue !== undefined) {
    field.default = defaultValue;
  }

  return field;
}

function makeField(field: any, name: string): any {
  const astNode = field.astNode;

  const virtual = findVirtualDirective(astNode.directives || []);
  if (virtual) {
    return null;
  }

  return parseFieldTypeDefinition(astNode, field.type);
}

function findTimestampFields(interfaces: any[]): any {
  const record = interfaces.find((row: any) => row.name.toLowerCase() === 'timestamped');

  if (!record) {
    return {};
  }

  const fields: string[] = (record.astNode?.fields || []).map((r: any) => r.name?.value || '');

  const createdAt = fields.find((r: string) => r.includes('creat')) || null;
  const updatedAt =
    fields.find((r: string) => r.toLowerCase().includes('modifi') || r.toLowerCase().includes('update')) || null;

  return { timestamps: { createdAt, updatedAt } };
}

function makeSchemaOptions(schema: any): any {
  const options = { strict: true };

  const timestampFields = findTimestampFields(schema.interfaces || []);
  Object.assign(options, timestampFields);

  return options;
}

function makeLocalizationConfig(schemaConfig: any) {
  const config: any = {
    locale: {
      type: String,
      required: true,
      default: 'en',
      lowercase: true,
    },
  };

  Object.keys(schemaConfig).forEach((key: string) => {
    if (schemaConfig[key].localized) {
      config[key] = { ...schemaConfig[key] };
    }
  });

  return { type: [config], default: [] };
}

function makeModel(schema: any): any {
  const schemaConfig: any = {};

  Object.keys(schema.fields).forEach((name) => {
    if (name === 'id') {
      return;
    }
    // if (name === 'localizations') {
    //   schemaConfig.localizations = {};
    //   return;
    // }
    const field = schema.fields[name];
    const config = makeField(field, name);
    if (config) {
      schemaConfig[name] = config;
    }
  });

  // if (schemaConfig.localizations) {
  //   schemaConfig.localizations = makeLocalizationConfig(schemaConfig);
  // }

  return schemaConfig;
}

export function parseSchemaForDatabase(schema: GraphQLSchema): any {
  const typeMap = schema.getTypeMap();

  const models: any = {};

  Object.keys(typeMap).forEach((key) => {
    const schemaType = schema.getType(key);
    if (!schemaType) {
      return;
    }

    const config = schemaType.toConfig();

    if (!hasDatabase(config)) {
      return;
    }

    const modelOptions = makeSchemaOptions(config);
    const fieldsConfig = makeModel(config);

    if (modelOptions.timestamps) {
      Object.values(modelOptions.timestamps).forEach((value: any) => {
        delete fieldsConfig[value];
      });
    }
    models[key] = new MongooseSchema(fieldsConfig, modelOptions);
  });
  return models;
}

export const version = '1.0.0';
