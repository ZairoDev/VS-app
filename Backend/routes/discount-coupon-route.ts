import express from 'express';

import{
  createCoupon,
  getAllCoupons,
  applyCoupon,
  updateCouponUsage,
}from '../controllers/discountCouponControllers';

const router = express.Router();

router.post('/create', createCoupon);
router.get('/get-all', getAllCoupons);
router.post('/apply', applyCoupon);
router.post('/update-usage', updateCouponUsage); 
      
export default router;