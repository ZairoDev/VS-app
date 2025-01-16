var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Properties } from "../models/property.js";
export const getAllProperties = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("inside getAllProperties");
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const properties = yield Properties.find().skip(skip).limit(limit);
        res.status(200).json({
            success: true,
            data: properties,
        });
    }
    catch (error) {
        console.error("Error fetching results", error);
        res.status(500).json({
            success: false,
            message: "failed to fetch properties",
            error: error.message,
        });
    }
});
export const getOneProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("inside one property route");
    try {
        const id = req.params.id;
        console.log("id", id);
        const ParticularProperty = yield Properties.findById(id);
        console.log("particularproperty", ParticularProperty);
        res.status(200).json({
            success: true,
            data: ParticularProperty,
        });
    }
    catch (error) {
        console.error("error fetching properties", error);
    }
});
export const temp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("call in temp");
    res.json({ message: "successfullllll" });
});
//# sourceMappingURL=PropertyController.js.map