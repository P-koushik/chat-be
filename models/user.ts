import mongoose , {model, Schema} from "mongoose"
import { TUser } from "../types/user-schema"

const user_schema = new Schema<TUser>(
    {
        email:{type:String , required:true, unique:true},
        username:{type:String , required:true}
    },{
        timestamps:true
    }
)

export const User = mongoose.models.User || model<TUser>("User",user_schema)