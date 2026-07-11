import { Request, Response } from 'express';
import Product from '../models/product';
import User from '../models/user';
import { AuthRequest } from '../middleware/authMiddleware';
import { ProductTag } from '../config/constants';

// Mapping dictionaries to connect user concerns to database tags
const CONCERN_TO_TAG_MAP: Record<string, ProductTag> = {
  'Acne': 'anti-acne',
  'Aging/Wrinkles': 'anti-aging',
  'Dark Spots/Hyperpigmentation': 'brightening',
  'Redness/Rosacea': 'soothing',
  'Dehydration': 'hydrating',
  'Dullness': 'brightening'
};

const SKIN_TYPE_TO_TAG_MAP: Record<string, ProductTag> = {
  'Normal': 'for-normal-skin',
  'Oily': 'for-oily-skin',
  'Dry': 'for-dry-skin',
  'Combination': 'for-combination-skin',
  'Sensitive': 'for-sensitive-skin'
};

const HAIR_TYPE_TO_TAG_MAP: Record<string, ProductTag> = {
  'Normal': 'for-normal-hair',
  'Oily': 'for-oily-hair',
  'Dry': 'for-dry-hair',
  'Damaged/Frizzy': 'for-damaged-hair',
  'Thinning/Hair Loss': 'hair-loss',
  'Dandruff-Prone': 'anti-dandruff'
};

const ALLERGY_TO_TAG_MAP: Record<string, ProductTag> = {
  'Fragrance': 'contains-fragrance',
  'Parabens': 'contains-parabens',
  'Sulfates': 'contains-sulfates',
  'Silicones': 'contains-silicones',
  'Essential Oils': 'contains-essential-oils'
};

// 1. Get All Products (With Category and Search Filters)
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, tag } = req.query;
    const query: any = {};

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Search by Name (case-insensitive)
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by single product tag
    if (tag) {
      query.tags = tag;
    }

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving products', error });
  }
};

// 2. Get Single Product
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 3. Create Product (Admin Only)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, stockQuantity, imageUrl, galleryImages, category, discountPercentage, lowStockThreshold, tags } = req.body;

    if (!imageUrl) {
      res.status(400).json({ message: 'Primary image is required.' });
      return;
    }

    const newProduct = new Product({
      name,
      description,
      price,
      stockQuantity,
      imageUrl,
      galleryImages,
      category,
      discountPercentage,
      lowStockThreshold,
      tags
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

// 4. Update Product (Admin Only)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// 5. Delete Product (Admin Only)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

// 6. GET PERSONALIZED RECOMMENDATIONS (The Smart Engine)
export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // 1. Fetch the user's customer profile
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: 'User profile not found' });
      return;
    }

    const { skinType, skinConcerns, hairType, allergies } = user.customerProfile;

    // 2. Build the list of tags we WANT to target
    const targetTags: ProductTag[] = [];

    if (SKIN_TYPE_TO_TAG_MAP[skinType]) {
      targetTags.push(SKIN_TYPE_TO_TAG_MAP[skinType]);
    }
    
    if (HAIR_TYPE_TO_TAG_MAP[hairType]) {
      targetTags.push(HAIR_TYPE_TO_TAG_MAP[hairType]);
    }

    skinConcerns.forEach(concern => {
      if (CONCERN_TO_TAG_MAP[concern]) {
        targetTags.push(CONCERN_TO_TAG_MAP[concern]);
      }
    });

    // 3. Build the list of allergen tags we MUST EXCLUDE
    const excludedTags: ProductTag[] = [];
    allergies.forEach(allergy => {
      if (ALLERGY_TO_TAG_MAP[allergy]) {
        excludedTags.push(ALLERGY_TO_TAG_MAP[allergy]);
      }
    });

    // 4. Construct high-performance MongoDB query:
    // Match any products containing target tags, AND make sure they DO NOT contain allergen tags
    const query: any = {
      tags: { 
        $in: targetTags,        // Matches any product with these target tags
        $nin: excludedTags      // Strictly excludes any product containing the user's allergens
      }
    };

    const recommendedProducts = await Product.find(query);

    res.status(200).json({
      matchingCriteria: { targetTags, excludedTags },
      count: recommendedProducts.length,
      products: recommendedProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating recommendations', error });
  }
};