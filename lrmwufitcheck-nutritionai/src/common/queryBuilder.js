const platforms = ["elastic", "sequelize", "mongodb"];
const Sequelize = require("sequelize");

class ElasticExpression {
  constructor() {
    this.expression = null;
  }
  build() {
    return null;
  }
}

class ElasticEqualExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { term: { [this.r]: { value: this.l } } };
  }
}

class ElasticNotEqualExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    const positiveQuery = { [this.r]: this.l };
    return { bool: { must_not: positiveQuery } };
  }
}

class ElasticGreaterThanExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { range: { [this.r]: { gt: this.l } } };
  }
}

class ElasticGreaterThanOrEqualExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { range: { [this.r]: { gte: this.l } } };
  }
}

class ElasticLessThanExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { range: { [this.r]: { lt: this.l } } };
  }
}

class ElasticLessThanOrEqualExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { range: { [this.r]: { lte: this.l } } };
  }
}

class ElasticInExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { terms: { [this.r]: this.l } };
  }
}

class ElasticNotInExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { bool: { must_not: { terms: { [this.r]: this.l } } } };
  }
}

class ElasticLikeExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { wildcard: { [this.r]: this.l } };
  }
}

class ElasticILikeExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { wildcard: { [this.r]: this.l } };
  }
}

class ElasticNotLikeExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { bool: { must_not: { wildcard: { [this.r]: this.l } } } };
  }
}

class ElasticNotILikeExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { bool: { must_not: { wildcard: { [this.r]: this.l } } } };
  }
}

class ElasticIsNullExpression extends ElasticExpression {
  constructor(r) {
    super();
    this.r = r;
  }
  build() {
    return { bool: { must_not: { exists: { field: this.r } } } };
  }
}

class ElasticNotNullExpression extends ElasticExpression {
  constructor(r) {
    super();
    this.r = r;
  }
  build() {
    return { exists: { field: this.r } };
  }
}

class ElasticBetweenExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { range: { [this.r]: { gte: this.l[0], lte: this.l[1] } } };
  }
}

class ElasticNotBetweenExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return {
      bool: {
        must_not: { range: { [this.r]: { gte: this.l[0], lte: this.l[1] } } },
      },
    };
  }
}

class ElasticContainsExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { match: { [this.r]: this.l } };
  }
}

class ElasticNotContainsExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { bool: { must_not: { match: { [this.r]: this.l } } } };
  }
}

class ElasticStartsExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { prefix: { [this.r]: this.l } };
  }
}

class ElasticNotStartsExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { bool: { must_not: { prefix: { [this.r]: this.l } } } };
  }
}

class ElasticEndsExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { wildcard: { [this.r]: this.l } };
  }
}

class ElasticNotEndsExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { bool: { must_not: { wildcard: { [this.r]: this.l } } } };
  }
}

class ElasticMatchExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { match: { [this.r]: this.l } };
  }
}

class ElasticNotMatchExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { bool: { must_not: { match: { [this.r]: this.l } } } };
  }
}

class ElasticOverlapExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { match: { [this.r]: this.l } };
  }
}

class ElasticNotOverlapExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r;
    this.l = l;
  }
  build() {
    return { bool: { must_not: { match: { [this.r]: this.l } } } };
  }
}

class ElasticAndExpression extends ElasticExpression {
  constructor(expArray) {
    super();
    this.expArray = expArray;
  }
  build() {
    return {
      bool: {
        must: this.expArray.map((exp) => (exp?.build ? exp.build() : exp)),
      },
    };
  }
}

class ElasticOrExpression extends ElasticExpression {
  constructor(expArray) {
    super();
    this.expArray = expArray;
  }
  build() {
    return {
      bool: {
        should: this.expArray.map((exp) => (exp?.build ? exp.build() : exp)),
      },
    };
  }
}

class ElasticNotExpression extends ElasticExpression {
  constructor(exp) {
    super();
    this.exp = exp;
  }
  build() {
    return {
      bool: { must_not: this.exp?.build ? this.exp.build() : this.exp },
    };
  }
}

class ElasticNorExpression extends ElasticExpression {
  constructor(expArray) {
    super();
    this.expArray = expArray;
  }
  build() {
    return {
      bool: {
        must_not: this.expArray.map((exp) => (exp?.build ? exp.build() : exp)),
      },
    };
  }
}

class SequelizeEqualExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: this.l };
  }
}

class SequelizeNotEqualExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.ne]: this.l } };
  }
}

class SequelizeGreaterThanExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.gt]: this.l } };
  }
}

class SequelizeGreaterThanOrEqualExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.gte]: this.l } };
  }
}

class SequelizeLessThanExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.lt]: this.l } };
  }
}

class SequelizeLessThanOrEqualExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.lte]: this.l } };
  }
}

class SequelizeInExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.in]: this.l ?? [] } };
  }
}

class SequelizeNotInExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.notIn]: this.l ?? [] } };
  }
}

class SequelizeLikeExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.like]: this.l } };
  }
}

class SequelizeILikeExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.iLike]: this.l } };
  }
}

class SequelizeNotLikeExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.notLike]: this.l } };
  }
}

class SequelizeNotILikeExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.notILike]: this.l } };
  }
}

class SequelizeIsNullExpression {
  constructor(r) {
    this.r = r;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.is]: null } };
  }
}

class SequelizeNotNullExpression {
  constructor(r) {
    this.r = r;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.not]: null } };
  }
}

class SequelizeBetweenExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.between]: this.l } };
  }
}

class SequelizeNotBetweenExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.notBetween]: this.l } };
  }
}

class SequelizeContainsExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    const val = Array.isArray(this.l) ? this.l : [this.l];
    return { [this.r]: { [Sequelize.Op.contains]: val } };
  }
}

class SequelizeNotContainsExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    const val = Array.isArray(this.l) ? this.l : [this.l];
    return { [this.r]: { [Sequelize.Op.notContains]: val } };
  }
}

class SequelizeStartsExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.startsWith]: this.l } };
  }
}

class SequelizeNotStartsExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.notStartsWith]: this.l } };
  }
}

class SequelizeEndsExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.endsWith]: this.l } };
  }
}

class SequelizeNotEndsExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.notEndsWith]: this.l } };
  }
}

class SequelizeMatchExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.match]: this.l } };
  }
}

class SequelizeNotMatchExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.notMatch]: this.l } };
  }
}

class SequelizeOverlapExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [this.r]: { [Sequelize.Op.overlap]: this.l } };
  }
}

class SequelizeNotOverlapExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return { [Op.not]: { [this.r]: { [Sequelize.Op.overlap]: this.l } } };
  }
}

class SequelizeAndExpression {
  constructor(expArray) {
    this.expArray = expArray;
  }
  build() {
    return {
      [Sequelize.Op.and]: this.expArray.map((exp) =>
        exp?.build ? exp.build() : exp,
      ),
    };
  }
}

class SequelizeOrExpression {
  constructor(expArray) {
    this.expArray = expArray;
  }
  build() {
    return {
      [Sequelize.Op.or]: this.expArray.map((exp) =>
        exp?.build ? exp.build() : exp,
      ),
    };
  }
}

class SequelizeNotExpression {
  constructor(exp) {
    this.exp = exp;
  }
  build() {
    return {
      [Sequelize.Op.not]: this.exp?.build ? this.exp.build() : this.exp,
    };
  }
}

class SequelizeNorExpression {
  constructor(expArray) {
    this.expArray = expArray;
  }
  build() {
    return {
      [Sequelize.Op.not]: this.expArray.map((exp) =>
        exp?.build ? exp.build() : exp,
      ),
    };
  }
}

class MongoDbEqualExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: this.r };
  }
}

class MongoDbNotEqualExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $ne: this.r } };
  }
}

class MongoDbGreaterThanExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $gt: this.r } };
  }
}

class MongoDbGreaterThanOrEqualExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $gte: this.r } };
  }
}

class MongoDbLessThanExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $lt: this.r } };
  }
}

class MongoDbLessThanOrEqualExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $lte: this.r } };
  }
}

class MongoDbInExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $in: this.r ?? [] } };
  }
}

class MongoDbNotInExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $nin: this.r ?? [] } };
  }
}

class MongoDbLikeExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $regex: new RegExp(this.r), $options: "i" } };
  }
}

class MongoDbNotLikeExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $not: new RegExp(this.r), $options: "i" } };
  }
}

class MongoDbILikeExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $regex: new RegExp(this.r), $options: "i" } };
  }
}

class MongoDbNotILikeExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $not: new RegExp(this.r), $options: "i" } };
  }
}

class MongoDbIsNullExpression {
  constructor(r) {
    this.r = r;
  }
  build() {
    return { [this.r]: null };
  }
}

class MongoDbNotNullExpression {
  constructor(r) {
    this.r = r;
  }
  build() {
    return { [this.r]: { $ne: null } };
  }
}

class MongoDbBetweenExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return {
      [this.r]: {
        $gte: this.l[0],
        $lte: this.l[1],
      },
    };
  }
}

class MongoDbNotBetweenExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    return {
      [this.r]: {
        $not: {
          $gte: this.l[0],
          $lte: this.l[1],
        },
      },
    };
  }
}

class MongoDbContainsExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $elemMatch: { $eq: this.r } } };
  }
}

class MongoDbNotContainsExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return {
      [this.l]: { $not: { $elemMatch: { $eq: this.r } } },
    };
  }
}

class MongoDbStartsExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $regex: new RegExp("^" + this.r) } };
  }
}

class MongoDbNotStartsExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return {
      [this.l]: { $not: { $regex: new RegExp("^" + this.r) } },
    };
  }
}

class MongoDbEndsExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $regex: new RegExp(this.r + "$") } };
  }
}

class MongoDbNotEndsExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return {
      [this.l]: { $not: { $regex: new RegExp(this.r + "$") } },
    };
  }
}

class MongoDbMatchExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $regex: new RegExp(this.r) } };
  }
}

class MongoDbNotMatchExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return {
      [this.l]: { $not: { $regex: new RegExp(this.r) } },
    };
  }
}

class MongoDbOverlapExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $elemMatch: { $in: this.r } } };
  }
}

class MongoDbNotOverlapExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return {
      [this.l]: { $not: { $elemMatch: { $in: this.r } } },
    };
  }
}

class MongoDbAndExpression {
  constructor(expArray) {
    this.expArray = expArray;
  }
  build() {
    return {
      $and: this.expArray.map((exp) => (exp?.build ? exp.build() : exp)),
    };
  }
}

class MongoDbOrExpression {
  constructor(expArray) {
    this.expArray = expArray;
  }
  build() {
    return {
      $or: this.expArray.map((exp) => (exp?.build ? exp.build() : exp)),
    };
  }
}

class MongoDbNotExpression {
  constructor(exp) {
    this.exp = exp;
  }
  build() {
    return {
      $not: this.exp?.build ? this.exp.build() : this.exp,
    };
  }
}

class MongoDbNorExpression {
  constructor(expArray) {
    this.expArray = expArray;
  }
  build() {
    return {
      $nor: this.expArray.map((exp) => (exp?.build ? exp.build() : exp)),
    };
  }
}

class MongoDbExistsExpression {
  constructor(l) {
    this.l = l;
  }
  build() {
    return { [this.l]: { $exists: true } };
  }
}

class MongoDbNotExistsExpression {
  constructor(l) {
    this.l = l;
  }
  build() {
    return { [this.l]: { $exists: false } };
  }
}

class MongoDbAllExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $all: this.r } };
  }
}

class MongoDbNotAllExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $not: { $all: this.r } } };
  }
}

class MongoDbSizeExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $size: this.r } };
  }
}

class MongoDbNotSizeExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $not: { $size: this.r } } };
  }
}

class MongoDbAnyExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return { [this.l]: { $elemMatch: { $in: this.r } } };
  }
}

class MongoDbNotAnyExpression {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
  build() {
    return {
      [this.l]: { $not: { $elemMatch: { $in: this.r } } },
    };
  }
}

// --- GEO NEAR: left = field name, right = { point, maxDistance, minDistance? } ----

// Elastic: geo_distance / geo_distance_range
class ElasticGeoNearExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r; // field name
    this.l = l; // { point:{type:'Point',coordinates:[lon,lat]}, maxDistance, minDistance? }
  }
  build() {
    const { point, maxDistance, minDistance } = this.l || {};
    const [lon, lat] = point?.coordinates ?? [];
    if (minDistance != null) {
      return {
        geo_distance_range: {
          from: `${minDistance}m`,
          to: `${maxDistance}m`,
          [this.r]: { lon, lat },
        },
      };
    }
    return {
      geo_distance: {
        distance: `${maxDistance}m`,
        [this.r]: { lon, lat },
      },
    };
  }
}

// Sequelize (PostGIS): ST_DWithin + optional minDistance via ST_Distance >= min
class SequelizeGeoNearExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    const { point, maxDistance, minDistance } = this.l || {};
    const [lon, lat] = point?.coordinates ?? [];
    const pointGeog = Sequelize.literal(
      `ST_SetSRID(ST_MakePoint(${lon}, ${lat}),4326)::geography`,
    );

    const clauses = [
      Sequelize.where(
        Sequelize.fn(
          "ST_DWithin",
          Sequelize.col(this.r),
          pointGeog,
          maxDistance,
        ),
        true,
      ),
    ];

    if (minDistance != null) {
      clauses.push(
        Sequelize.where(
          Sequelize.fn("ST_Distance", Sequelize.col(this.r), pointGeog),
          { [Sequelize.Op.gte]: minDistance },
        ),
      );
    }

    return { [Sequelize.Op.and]: clauses };
  }
}

// MongoDB/Mongoose: $nearSphere with $maxDistance / $minDistance
class MongoDbGeoNearExpression {
  constructor(l, r) {
    this.l = l; // field name (note Mongo classes use (l, r))
    this.r = r; // options object
  }
  build() {
    const { point, maxDistance, minDistance } = this.r || {};
    const near = {
      $nearSphere: {
        $geometry: point,
        ...(maxDistance != null ? { $maxDistance: maxDistance } : {}),
        ...(minDistance != null ? { $minDistance: minDistance } : {}),
      },
    };
    return { [this.l]: near };
  }
}

// --- GEO WITHIN: left = field name, right = { shape?: GeoJSON, bbox?: [minLon,minLat,maxLon,maxLat] } ----

// Elasticsearch
class ElasticGeoWithinExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r; // field name
    this.l = l; // { shape? , bbox? }
  }
  build() {
    const { shape, bbox } = this.l || {};

    // BBox -> geo_bounding_box (works when field is geo_point or geo_shape)
    if (Array.isArray(bbox) && bbox.length === 4) {
      const [minLon, minLat, maxLon, maxLat] = bbox;
      return {
        geo_bounding_box: {
          [this.r]: {
            top_left: { lon: minLon, lat: maxLat },
            bottom_right: { lon: maxLon, lat: minLat },
          },
        },
      };
    }

    // Polygon fast-path for geo_point fields
    if (shape?.type === "Polygon" && Array.isArray(shape.coordinates?.[0])) {
      const points = shape.coordinates[0].map(([lon, lat]) => ({ lon, lat }));
      return { geo_polygon: { [this.r]: { points } } };
    }

    // Generic geo_shape (requires field mapped as geo_shape)
    if (shape) {
      return {
        geo_shape: {
          [this.r]: {
            shape,
            relation: "within",
          },
        },
      };
    }

    throw new Error(
      `$geoWithin requires either 'shape' (GeoJSON) or 'bbox' [minLon,minLat,maxLon,maxLat]`,
    );
  }
}

// Sequelize (PostGIS)
class SequelizeGeoWithinExpression {
  constructor(r, l) {
    this.r = r;
    this.l = l;
  }
  build() {
    const { shape, bbox } = this.l || {};

    // BBox: intersect field with envelope (cast to geometry for fast bbox)
    if (Array.isArray(bbox) && bbox.length === 4) {
      const [minLon, minLat, maxLon, maxLat] = bbox;
      const envelope = Sequelize.literal(
        `ST_MakeEnvelope(${minLon}, ${minLat}, ${maxLon}, ${maxLat}, 4326)`,
      );
      // Cast column to geometry to compare with envelope (also geometry)
      const fieldGeom = Sequelize.literal(`("${this.r}")::geometry`);
      return Sequelize.where(
        Sequelize.fn("ST_Intersects", fieldGeom, envelope),
        true,
      );
    }

    // Polygon/MultiPolygon: prefer geography COVERS for point-in-polygon;
    // works when column is GEOGRAPHY(POINT,4326). Fall back to geometry CONTAINS if you need strict semantics.
    if (shape && (shape.type === "Polygon" || shape.type === "MultiPolygon")) {
      const shapeGeog = Sequelize.literal(
        `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(shape)}'),4326)::geography`,
      );
      return Sequelize.where(
        Sequelize.fn("ST_Covers", shapeGeog, Sequelize.col(this.r)),
        true,
      );
    }

    // Generic geometry containment (when both sides are geometry)
    if (shape) {
      const shapeGeom = Sequelize.literal(
        `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(shape)}'),4326)`,
      );
      const fieldGeom = Sequelize.literal(`("${this.r}")::geometry`);
      return Sequelize.where(
        Sequelize.fn("ST_Within", fieldGeom, shapeGeom),
        true,
      );
    }

    throw new Error(
      `$geoWithin requires either 'shape' (GeoJSON) or 'bbox' [minLon,minLat,maxLon,maxLat]`,
    );
  }
}

// MongoDB / Mongoose
class MongoDbGeoWithinExpression {
  constructor(l, r) {
    this.l = l; // field name  (Mongo classes use (l,r))
    this.r = r; // { shape? , bbox? }
  }
  build() {
    const { shape, bbox } = this.r || {};

    if (Array.isArray(bbox) && bbox.length === 4) {
      const [minLon, minLat, maxLon, maxLat] = bbox;
      return {
        [this.l]: {
          $geoWithin: {
            $box: [
              [minLon, minLat],
              [maxLon, maxLat],
            ],
          },
        },
      };
    }

    if (shape) {
      return { [this.l]: { $geoWithin: { $geometry: shape } } };
    }

    throw new Error(
      `$geoWithin requires either 'shape' (GeoJSON) or 'bbox' [minLon,minLat,maxLon,maxLat]`,
    );
  }
}

// --- GEO CONTAINS: left = field name, right = { shape: GeoJSON } ----

// Elasticsearch: field (geo_shape) contains the given shape
class ElasticGeoContainsExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r; // field name
    this.l = l; // { shape }
  }
  build() {
    const { shape } = this.l || {};
    if (!shape) throw new Error(`$geoContains requires { shape: <GeoJSON> }`);
    return {
      geo_shape: {
        [this.r]: {
          shape,
          relation: "contains",
        },
      },
    };
  }
}

// Sequelize (PostGIS): strict DE-9IM contains on geometry
class SequelizeGeoContainsExpression {
  constructor(r, l) {
    this.r = r; // field name
    this.l = l; // { shape }
  }
  build() {
    const { shape } = this.l || {};
    if (!shape) throw new Error(`$geoContains requires { shape: <GeoJSON> }`);

    // Cast the field to geometry (works whether column is GEOGRAPHY or GEOMETRY)
    const fieldGeom = Sequelize.literal(`("${this.r}")::geometry`);
    const shapeGeom = Sequelize.literal(
      `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(shape)}'),4326)`,
    );

    // ST_Contains(field_geom, shape_geom) — strict "contains" (excludes boundary-only touch)
    return Sequelize.where(
      Sequelize.fn("ST_Contains", fieldGeom, shapeGeom),
      true,
    );
  }
}

// MongoDB/Mongoose: no native $contains; use $geoIntersects from the polygon/area field side
// Semantics: returns docs whose area "intersects" the given shape (includes contains).
// For point containment this is effectively "point inside or on boundary".
class MongoDbGeoContainsExpression {
  constructor(l, r) {
    this.l = l; // field name
    this.r = r; // { shape }
  }
  build() {
    const { shape } = this.r || {};
    if (!shape) throw new Error(`$geoContains requires { shape: <GeoJSON> }`);
    return {
      [this.l]: {
        $geoIntersects: { $geometry: shape },
      },
    };
  }
}

// --- GEO INTERSECTS: left = field name, right = { shape: GeoJSON } ----

// Elasticsearch: field (geo_shape) intersects the given shape
class ElasticGeoIntersectsExpression extends ElasticExpression {
  constructor(r, l) {
    super();
    this.r = r; // field name
    this.l = l; // { shape }
  }
  build() {
    const { shape } = this.l || {};
    if (!shape) throw new Error(`$geoIntersects requires { shape: <GeoJSON> }`);
    return {
      geo_shape: {
        [this.r]: {
          shape,
          relation: "intersects",
        },
      },
    };
  }
}

// Sequelize (PostGIS): ST_Intersects on geometry (works if column is GEOGRAPHY or GEOMETRY)
class SequelizeGeoIntersectsExpression {
  constructor(r, l) {
    this.r = r; // field name
    this.l = l; // { shape }
  }
  build() {
    const { shape } = this.l || {};
    if (!shape) throw new Error(`$geoIntersects requires { shape: <GeoJSON> }`);

    const fieldGeom = Sequelize.literal(`("${this.r}")::geometry`);
    const shapeGeom = Sequelize.literal(
      `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify(shape)}'),4326)`,
    );

    return Sequelize.where(
      Sequelize.fn("ST_Intersects", fieldGeom, shapeGeom),
      true,
    );
  }
}

// MongoDB / Mongoose: native $geoIntersects
class MongoDbGeoIntersectsExpression {
  constructor(l, r) {
    this.l = l; // field name
    this.r = r; // { shape }
  }
  build() {
    const { shape } = this.r || {};
    if (!shape) throw new Error(`$geoIntersects requires { shape: <GeoJSON> }`);
    return {
      [this.l]: {
        $geoIntersects: { $geometry: shape },
      },
    };
  }
}

const ElasticExpressions = {
  eq: ElasticEqualExpression,
  ne: ElasticNotEqualExpression,
  gt: ElasticGreaterThanExpression,
  gte: ElasticGreaterThanOrEqualExpression,
  lt: ElasticLessThanExpression,
  lte: ElasticLessThanOrEqualExpression,
  in: ElasticInExpression,
  nin: ElasticNotInExpression,
  like: ElasticLikeExpression,
  nlike: ElasticNotLikeExpression,
  ilike: ElasticILikeExpression,
  nilike: ElasticNotILikeExpression,
  isnull: ElasticIsNullExpression,
  notnull: ElasticNotNullExpression,
  // MongoDB-style aliases — the value is ignored (matches the existing Mongo
  // behavior at MongoDbExistsExpression). Use $nexists for is-null semantics.
  exists: ElasticNotNullExpression,
  nexists: ElasticIsNullExpression,
  between: ElasticBetweenExpression,
  nbetween: ElasticNotBetweenExpression,
  contains: ElasticContainsExpression,
  ncontains: ElasticNotContainsExpression,
  starts: ElasticStartsExpression,
  nstarts: ElasticNotStartsExpression,
  ends: ElasticEndsExpression,
  nends: ElasticNotEndsExpression,
  match: ElasticMatchExpression,
  nmatch: ElasticNotMatchExpression,
  overlap: ElasticOverlapExpression,
  noverlap: ElasticNotOverlapExpression,
  and: ElasticAndExpression,
  or: ElasticOrExpression,
  not: ElasticNotExpression,
  nor: ElasticNorExpression,
};

const SequelizeExpressions = {
  eq: SequelizeEqualExpression,
  ne: SequelizeNotEqualExpression,
  gt: SequelizeGreaterThanExpression,
  gte: SequelizeGreaterThanOrEqualExpression,
  lt: SequelizeLessThanExpression,
  lte: SequelizeLessThanOrEqualExpression,
  in: SequelizeInExpression,
  nin: SequelizeNotInExpression,
  like: SequelizeLikeExpression,
  nlike: SequelizeNotLikeExpression,
  ilike: SequelizeILikeExpression,
  nilike: SequelizeNotILikeExpression,
  isnull: SequelizeIsNullExpression,
  notnull: SequelizeNotNullExpression,
  // MongoDB-style aliases — the value is ignored (matches the existing Mongo
  // behavior at MongoDbExistsExpression). Use $nexists for is-null semantics.
  exists: SequelizeNotNullExpression,
  nexists: SequelizeIsNullExpression,
  between: SequelizeBetweenExpression,
  nbetween: SequelizeNotBetweenExpression,
  contains: SequelizeContainsExpression,
  ncontains: SequelizeNotContainsExpression,
  starts: SequelizeStartsExpression,
  nstarts: SequelizeNotStartsExpression,
  ends: SequelizeEndsExpression,
  nends: SequelizeNotEndsExpression,
  match: SequelizeMatchExpression,
  nmatch: SequelizeNotMatchExpression,
  overlap: SequelizeOverlapExpression,
  noverlap: SequelizeNotOverlapExpression,
  and: SequelizeAndExpression,
  or: SequelizeOrExpression,
  not: SequelizeNotExpression,
  nor: SequelizeNorExpression,
};

const MongoDbExpressions = {
  eq: MongoDbEqualExpression,
  ne: MongoDbNotEqualExpression,
  gt: MongoDbGreaterThanExpression,
  gte: MongoDbGreaterThanOrEqualExpression,
  lt: MongoDbLessThanExpression,
  lte: MongoDbLessThanOrEqualExpression,
  in: MongoDbInExpression,
  nin: MongoDbNotInExpression,
  like: MongoDbLikeExpression,
  nlike: MongoDbNotLikeExpression,
  ilike: MongoDbILikeExpression,
  nilike: MongoDbNotILikeExpression,
  isnull: MongoDbIsNullExpression,
  notnull: MongoDbNotNullExpression,
  between: MongoDbBetweenExpression,
  nbetween: MongoDbNotBetweenExpression,
  contains: MongoDbContainsExpression,
  ncontains: MongoDbNotContainsExpression,
  starts: MongoDbStartsExpression,
  nstarts: MongoDbNotStartsExpression,
  ends: MongoDbEndsExpression,
  nends: MongoDbNotEndsExpression,
  match: MongoDbMatchExpression,
  nmatch: MongoDbNotMatchExpression,
  overlap: MongoDbOverlapExpression,
  noverlap: MongoDbNotOverlapExpression,
  and: MongoDbAndExpression,
  or: MongoDbOrExpression,
  not: MongoDbNotExpression,
  nor: MongoDbNorExpression,
  exists: MongoDbExistsExpression,
  nexists: MongoDbNotExistsExpression,
  all: MongoDbAllExpression,
  notall: MongoDbNotAllExpression,
  size: MongoDbSizeExpression,
  notsize: MongoDbNotSizeExpression,
  any: MongoDbAnyExpression,
  notany: MongoDbNotAnyExpression,
};

// --- register the operator name "geonear" (so {$geoNear:{...}} -> op "geonear") ---
ElasticExpressions.geonear = ElasticGeoNearExpression;
SequelizeExpressions.geonear = SequelizeGeoNearExpression;
MongoDbExpressions.geonear = MongoDbGeoNearExpression;

// --- register ---
ElasticExpressions.geowithin = ElasticGeoWithinExpression;
SequelizeExpressions.geowithin = SequelizeGeoWithinExpression;
MongoDbExpressions.geowithin = MongoDbGeoWithinExpression;

// --- register ---
ElasticExpressions.geointersects = ElasticGeoIntersectsExpression;
SequelizeExpressions.geointersects = SequelizeGeoIntersectsExpression;
MongoDbExpressions.geointersects = MongoDbGeoIntersectsExpression;

// --- register the operator name "geonear" (so {$geoNear:{...}} -> op "geonear") ---
ElasticExpressions.geonear = ElasticGeoNearExpression;
SequelizeExpressions.geonear = SequelizeGeoNearExpression;
MongoDbExpressions.geonear = MongoDbGeoNearExpression;

// --- register ---
ElasticExpressions.geocontains = ElasticGeoContainsExpression;
SequelizeExpressions.geocontains = SequelizeGeoContainsExpression;
MongoDbExpressions.geocontains = MongoDbGeoContainsExpression;

// --- add this helper somewhere above convertKeyValueToQuery ---
const normalizeOp = (raw) => {
  if (!raw) return "";
  // strip leading $, trim, lowercase, collapse separators
  const lowered = raw
    .replace(/^\$+/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  // common aliases -> canonical keys you used in registries
  const alias = {
    equals: "eq",
    noteq: "ne",
    near: "geonear",
    geodistance: "geonear",
    geodistancelte: "geodistancelte",
    distancelte: "geodistancelte",
    within: "geowithin",
    containsgeo: "geocontains",
    intersects: "geointersects",
  };
  return alias[lowered] || lowered; // e.g. "geoNear" -> "geonear"
};

const convertKeyValueToQuery = (key, value, platform) => {
  if (key.startsWith("$")) {
    const opName = normalizeOp(key);
    const Ctor = platform[opName];
    if (!Ctor) throw new Error(`Unknown operator: ${key} → ${opName}`);
    return new Ctor(convertToSystemQuery(value, platform));
  } else {
    let op = "eq";
    let l = key;
    let r = value;
    if (Array.isArray(value)) {
      op = "in";
    } else if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof Date)
    ) {
      const innerKey = Object.keys(value)[0];
      op = normalizeOp(innerKey);
      r = value[innerKey];
    }
    const Ctor = platform[op];
    if (!Ctor) throw new Error(`Unknown operator: ${op}`);
    return new Ctor(l, r);
  }
};

// Walk the user-query tree and throw a readable error the moment we
// see an undefined value. We do NOT silently strip it — that path is
// dangerous for update/delete APIs, where a missing whereClause arm
// would broaden the operation to every row in the table. A loud
// failure here surfaces the real bug: an MScript whereClause is
// referencing a value the API layer never read (param not declared,
// param renamed, conditional source not reachable, etc.). Caller sees
// "MScript whereClause references undefined value at <path>" instead
// of the dialect's opaque `WHERE x = undefined` complaint.
//
// `path` accumulates a dotted breadcrumb so the error names the exact
// arm at fault, even deep inside `$or`/`$and` nesting:
//   $and[1].$or[0].artworkId
const assertNoUndefinedInQuery = (query, path = "") => {
  if (query === undefined) {
    throw new Error(
      `MScript whereClause references undefined value at \`${path || "(root)"}\`. The API parameter feeding this position is missing or unread — declare it in the API's parameters (or fix the MScript so it does not depend on an unread value). Refusing to run the query because dropping the clause would broaden the operation to every row.`,
    );
  }
  if (query === null) return;
  if (Array.isArray(query)) {
    for (let i = 0; i < query.length; i += 1) {
      assertNoUndefinedInQuery(query[i], `${path}[${i}]`);
    }
    return;
  }
  if (typeof query !== "object") return;
  for (const key of Object.keys(query)) {
    assertNoUndefinedInQuery(query[key], path ? `${path}.${key}` : key);
  }
};

const convertToSystemQuery = (query, platform) => {
  if (Array.isArray(query)) {
    return query.map((item) => convertToSystemQuery(item, platform));
  }

  if (query == null) return query;

  if (typeof query !== "object") return query;

  if (Object.keys(query).length === 0) {
    return query;
  }

  if (Object.keys(query).length === 1) {
    const key = Object.keys(query)[0];
    const value = query[key];
    return convertKeyValueToQuery(key, value, platform);
  }

  if (Object.keys(query).length > 1) {
    let expArray = [];
    Object.keys(query).forEach((key) => {
      const value = query[key];
      expArray.push(convertKeyValueToQuery(key, value, platform));
    });
    return new platform.and(expArray);
  }
};

// Robust against convertToSystemQuery returning a raw `{}` for an
// empty input — calling `.build()` on a plain object crashes with
// "is not a function". Treat that as "no filter" → null.
const buildOrNull = (mQuery) => {
  if (!mQuery) return null;
  if (typeof mQuery.build === "function") return mQuery.build();
  return null;
};

const convertUserQueryToElasticQuery = (userQuery) => {
  assertNoUndefinedInQuery(userQuery);
  let mQuery = convertToSystemQuery(userQuery, ElasticExpressions);
  return buildOrNull(mQuery);
};

const convertUserQueryToSequelizeQuery = (userQuery) => {
  assertNoUndefinedInQuery(userQuery);
  let mQuery = convertToSystemQuery(userQuery, SequelizeExpressions);
  return buildOrNull(mQuery);
};

const convertUserQueryToMongoDbQuery = (userQuery) => {
  const mapIdFields = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(mapIdFields);
    }
    if (obj && typeof obj === "object") {
      const newObj = {};
      for (const [key, value] of Object.entries(obj)) {
        const newKey = key === "id" ? "_id" : key;
        newObj[newKey] = mapIdFields(value);
      }
      return newObj;
    }
    return obj;
  };

  assertNoUndefinedInQuery(userQuery);
  const mappedQuery = mapIdFields(userQuery);
  let mQuery = convertToSystemQuery(mappedQuery, MongoDbExpressions);
  return buildOrNull(mQuery);
};

module.exports = {
  convertUserQueryToElasticQuery,
  convertUserQueryToSequelizeQuery,
  convertUserQueryToMongoDbQuery,
};
