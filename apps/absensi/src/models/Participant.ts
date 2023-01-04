import { nanoid } from "id-generator";
import { prop, plugin } from "@typegoose/typegoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { FilterQuery, PaginateOptions, PaginateResult } from "mongoose";

const nameRegExp =
  /^(?![ -.&,_'":?!])(?!.*[- &_'":]$)(?!.*[-.#@&,:?!]{2})[a-zA-Z- .,']+$/;
type PaginateMethod<T> = (
  query?: FilterQuery<T>,
  options?: PaginateOptions,
  callback?: (err: any, result: PaginateResult<T>) => void
) => Promise<PaginateResult<T>>;

@plugin(mongoosePaginate)
export class Participant {
  @prop({ required: true, unique: true, match: nameRegExp })
  public nama!: string;

  @prop({ required: true })
  public status!: string;

  @prop({ required: true, unique: true, default: () => nanoid(15) })
  public qrId!: string;

  @prop({ required: true, default: false })
  public sudahAbsen!: boolean;

  @prop({ required: true, default: false })
  public sudahMemilih!: boolean;

  static paginate: PaginateMethod<Participant>;
}