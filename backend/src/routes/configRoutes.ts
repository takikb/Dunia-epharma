import { Router, Request, Response } from 'express';
import { CATEGORIES, SKIN_TYPES, SKIN_CONCERNS, HAIR_TYPES, ALLERGIES, PRODUCT_TAGS } from '../config/constants';

const router = Router();

router.get('/constants', (req: Request, res: Response) => {
  res.json({
    categories: CATEGORIES,
    skinTypes: SKIN_TYPES,
    skinConcerns: SKIN_CONCERNS,
    hairTypes: HAIR_TYPES,
    allergies: ALLERGIES,
    productTags: PRODUCT_TAGS
  });
});

export default router;