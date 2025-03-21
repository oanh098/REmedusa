import {
  DMLSchema,
  IDmlEntityConfig,
  RelationshipOptions,
} from "@medusajs/types"
import { DmlEntity } from "./entity"
import {
  createBigNumberProperties,
  DMLSchemaWithBigNumber,
} from "./helpers/entity-builder/create-big-number-properties"
import {
  createDefaultProperties,
  DMLSchemaDefaults,
} from "./helpers/entity-builder/create-default-properties"
import { ArrayProperty } from "./properties/array"
import { AutoIncrementProperty } from "./properties/autoincrement"
import { BigNumberProperty } from "./properties/big-number"
import { BooleanProperty } from "./properties/boolean"
import { DateTimeProperty } from "./properties/date-time"
import { EnumLike, EnumProperty } from "./properties/enum"
import { IdProperty } from "./properties/id"
import { JSONProperty } from "./properties/json"
import { NumberProperty } from "./properties/number"
import { TextProperty } from "./properties/text"
import { BelongsTo } from "./relations/belongs-to"
import { HasMany } from "./relations/has-many"
import { HasOne } from "./relations/has-one"
import { HasOneWithForeignKey } from "./relations/has-one-fk"
import { ManyToMany } from "./relations/many-to-many"

/**
 * The implicit properties added by EntityBuilder in every schema
 */
const IMPLICIT_PROPERTIES = ["created_at", "updated_at", "deleted_at"]

export type DefineOptions =
  | string
  | {
      /**
       * The data model's name.
       */
      name?: string
      /**
       * The name of the data model's table in the database.
       */
      tableName: string
    }

export type ManyToManyOptions = RelationshipOptions &
  (
    | {
        /**
         * The name of the pivot table
         * created in the database for this relationship.
         */
        pivotTable?: string
        /**
         * @ignore
         */
        pivotEntity?: never
        /**
         * The column name in the pivot table that for the current entity
         */
        joinColumn?: string | string[]
        /**
         * The column name in the pivot table for the opposite entity
         */
        inverseJoinColumn?: string | string[]
      }
    | {
        /**
         * @ignore
         */
        pivotTable?: never
        /**
         * A function that returns the data model
         * representing the pivot table created in the
         * database for this relationship.
         */
        pivotEntity?: () => DmlEntity<any, any>
        /**
         * The column name in the pivot table that for the current entity
         */
        joinColumn?: string | string[]
        /**
         * The column name in the pivot table for the opposite entity
         */
        inverseJoinColumn?: string | string[]
      }
  )

/**
 * Entity builder exposes the API to create an entity and define its
 * schema using the shorthand methods.
 */
export class EntityBuilder {
  #disallowImplicitProperties(schema: DMLSchema) {
    const implicitProperties = Object.keys(schema).filter((fieldName) =>
      IMPLICIT_PROPERTIES.includes(fieldName)
    )

    if (implicitProperties.length) {
      throw new Error(
        `Cannot define field(s) "${implicitProperties.join(
          ","
        )}" as they are implicitly defined on every model`
      )
    }
  }

  /**
   * This method defines a data model.
   *
   * @typeParam Schema - The type of the accepted schema in the second parameter of the method.
   *
   * @param {DefineOptions} nameOrConfig - Either the data model's name, or configurations to name the data model.
   * The data model's name must be unique.
   * @param {Schema} schema - The schema of the data model's properties.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const MyCustom = model.define("my_custom", {
   *   id: model.id(),
   *   name: model.text(),
   * })
   *
   * export default MyCustom
   */
  define<Schema extends DMLSchema, const TConfig extends IDmlEntityConfig>(
    nameOrConfig: TConfig,
    schema: Schema
  ): DmlEntity<
    Schema & DMLSchemaWithBigNumber<Schema> & DMLSchemaDefaults,
    TConfig
  > {
    this.#disallowImplicitProperties(schema)

    return new DmlEntity<Schema, TConfig>(nameOrConfig, {
      ...schema,
      ...createBigNumberProperties(schema),
      ...createDefaultProperties(),
    }) as unknown as DmlEntity<
      Schema & DMLSchemaWithBigNumber<Schema> & DMLSchemaDefaults,
      TConfig
    >
  }

  /**
   * This method defines an automatically generated string ID property.
   *
   * You must use the "primaryKey" modifier to mark the property as the
   * primary key.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const User = model.define("User", {
   *   id: model.id().primaryKey(),
   *   // ...
   * })
   *
   * export default User
   *
   * @customNamespace Property Types
   */
  id(options?: { prefix?: string }) {
    return new IdProperty(options)
  }

  /**
   * This method defines a string property.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const MyCustom = model.define("my_custom", {
   *   name: model.text(),
   *   // ...
   * })
   *
   * export default MyCustom
   *
   * @customNamespace Property Types
   */
  text() {
    return new TextProperty()
  }

  /**
   * This method defines a boolean property.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const MyCustom = model.define("my_custom", {
   *   hasAccount: model.boolean(),
   *   // ...
   * })
   *
   * export default MyCustom
   *
   * @customNamespace Property Types
   */
  boolean() {
    return new BooleanProperty()
  }

  /**
   * This method defines a number property.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const MyCustom = model.define("my_custom", {
   *   age: model.number(),
   *   // ...
   * })
   *
   * export default MyCustom
   *
   * @customNamespace Property Types
   */
  number() {
    return new NumberProperty()
  }

  /**
   * This method defines a number property that expects large numbers, such as prices.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const MyCustom = model.define("my_custom", {
   *   price: model.bigNumber(),
   *   // ...
   * })
   *
   * export default MyCustom
   *
   * @customNamespace Property Types
   *
   * @privateRemarks
   * This property produces an additional
   * column - raw_{{ property_name }}, which stores the configuration
   * of bignumber (https://github.com/MikeMcl/bignumber.js)
   */
  bigNumber() {
    return new BigNumberProperty()
  }

  /**
   * This method defines an autoincrement property.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const MyCustom = model.define("my_custom", {
   *   serial_id: model.autoincrement(),
   *   // ...
   * })
   *
   * export default MyCustom
   *
   * @customNamespace Property
   */

  autoincrement() {
    return new AutoIncrementProperty()
  }

  /**
   * This method defines an array of strings property.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const MyCustom = model.define("my_custom", {
   *   names: model.array(),
   *   // ...
   * })
   *
   * export default MyCustom
   *
   * @customNamespace Property Types
   */
  array() {
    return new ArrayProperty()
  }

  /**
   * This method defines a timestamp property.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const MyCustom = model.define("my_custom", {
   *   date_of_birth: model.dateTime(),
   *   // ...
   * })
   *
   * export default MyCustom
   *
   * @customNamespace Property Types
   */
  dateTime() {
    return new DateTimeProperty()
  }

  /**
   * This method defines a property whose value is a stringified JSON object.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const MyCustom = model.define("my_custom", {
   *   metadata: model.json(),
   *   // ...
   * })
   *
   * export default MyCustom
   *
   * @customNamespace Property Types
   */
  json() {
    return new JSONProperty()
  }

  /**
   * This method defines a property whose value can only be one of the specified values.
   *
   * @typeParam Values - The type of possible values. By default, it's `string`.
   *
   * @param {Values[]} values - An array of possible values.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const MyCustom = model.define("my_custom", {
   *   color: model.enum(["black", "white"]),
   *   // ...
   * })
   *
   * export default MyCustom
   *
   * @customNamespace Property Types
   */
  enum<const Values extends unknown[] | EnumLike>(values: Values) {
    return new EnumProperty<Values>(values)
  }

  /**
   * This method defines a relationship between two data models,
   * where the owner of the relationship has one record of the related
   * data model.
   *
   * For example: A user "hasOne" email.
   *
   * Use the {@link belongsTo} method to define the inverse of this relationship in
   * the other data model.
   *
   * @typeParam T - The type of the entity builder passed as a first parameter. By default, it's
   * a function returning the related model.
   *
   * @param {T} entityBuilder - A function that returns the data model this model is related to.
   * @param {RelationshipOptions} options - The relationship's options.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const User = model.define("user", {
   *   id: model.id(),
   *   email: model.hasOne(() => Email),
   * })
   *
   * @customNamespace Relationship Methods
   */
  hasOne<T>(
    entityBuilder: T,
    options: RelationshipOptions & {
      foreignKey: true
    }
  ): HasOneWithForeignKey<T>
  hasOne<T>(
    entityBuilder: T,
    options?: RelationshipOptions & {
      foreignKey?: false
    }
  ): HasOne<T>
  hasOne<T>(
    entityBuilder: T,
    options?: RelationshipOptions & {
      foreignKey?: boolean
    }
  ): HasOneWithForeignKey<T> | HasOne<T> {
    if (options?.foreignKey) {
      return new HasOneWithForeignKey<T>(entityBuilder, options || {})
    }
    return new HasOne<T>(entityBuilder, options || {})
  }

  /**
   * This method defines the inverse of the {@link hasOne} or {@link hasMany} relationship.
   *
   * For example, a product "belongsTo" a store.
   *
   * @typeParam T - The type of the entity builder passed as a first parameter. By default, it's
   * a function returning the related model.
   *
   * @param {T} entityBuilder - A function that returns the data model this model is related to.
   * @param {RelationshipOptions} options - The relationship's options.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const Product = model.define("product", {
   *   id: model.id(),
   *   store: model.belongsTo(() => Store, {
   *     mappedBy: "products",
   *   }),
   * })
   *
   * @customNamespace Relationship Methods
   */
  belongsTo<T>(entityBuilder: T, options?: RelationshipOptions) {
    return new BelongsTo<T>(entityBuilder, options || {})
  }

  /**
   * This method defines a relationship between two data models,
   * where the owner of the relationship has many records of the related
   * data model, but the related data model only has one owner.
   *
   * For example, a store "hasMany" products.
   *
   * @typeParam T - The type of the entity builder passed as a first parameter. By default, it's
   * a function returning the related model.
   *
   * @param {T} entityBuilder - A function that returns the data model this model is related to.
   * @param {RelationshipOptions} options - The relationship's options.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const Store = model.define("store", {
   *   id: model.id(),
   *   products: model.hasMany(() => Product),
   * })
   *
   * @customNamespace Relationship Methods
   */
  hasMany<T>(entityBuilder: T, options?: RelationshipOptions) {
    return new HasMany<T>(entityBuilder, options || {})
  }

  /**
   * This method defines a relationship between two data models,
   * where both data models have many related records.
   *
   * For example, an order is associated with many products, and a product
   * is associated with many orders.
   *
   * @typeParam T - The type of the entity builder passed as a first parameter. By default, it's
   * a function returning the related model.
   *
   * @param {T} entityBuilder - A function that returns the data model this model is related to.
   * @param {RelationshipOptions} options - The relationship's options.
   *
   * @example
   * import { model } from "@medusajs/framework/utils"
   *
   * const Order = model.define("order", {
   *   id: model.id(),
   *   products: model.manyToMany(() => Product),
   * })
   *
   * const Product = model.define("product", {
   *   id: model.id(),
   *   order: model.manyToMany(() => Order),
   * })
   *
   * @customNamespace Relationship Methods
   */
  manyToMany<T>(entityBuilder: T, options?: ManyToManyOptions) {
    return new ManyToMany<T>(entityBuilder, options || {})
  }
}

export const model = new EntityBuilder()
