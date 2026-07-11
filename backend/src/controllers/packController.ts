import { Request, Response } from 'express';
import Pack from '../models/pack';
import { AuthRequest } from '../middleware/authMiddleware';

// 1. Create a Product Pack (Admin Only)
export const createPack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, products, price, imageUrl, tags } = req.body;

    if (!products || products.length < 2) {
      res.status(400).json({ message: 'A pack must contain at least 2 products.' });
      return;
    }

    const newPack = new Pack({
      name,
      description,
      products,
      price,
      imageUrl,
      tags
    });

    await newPack.save();
    res.status(201).json({ message: 'Pack created successfully!', pack: newPack });
  } catch (error) {
    res.status(500).json({ message: 'Error creating pack', error });
  }
};

// 2. Get All Packs (Public) - Populates products and dynamically calculates stock
export const getPacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const packs = await Pack.find().populate('products', 'name stockQuantity price imageUrl');

    // Dynamically calculate stock levels for each pack on the fly
    const formattedPacks = packs.map(pack => {
      const subProducts = pack.products as any[];
      
      // Pack stock is the minimum stock level among all sub-products
      const calculatedStock = subProducts.length > 0 
        ? Math.min(...subProducts.map(p => p.stockQuantity))
        : 0;

      return {
        ...pack.toObject(),
        stockQuantity: calculatedStock,
        isOutOfStock: calculatedStock === 0
      };
    });

    res.status(200).json(formattedPacks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving packs', error });
  }
};

// 3. Get Single Pack details
export const getPackById = async (req: Request, res: Response): Promise<void> => {
  try {
    const pack = await Pack.findById(req.params.id).populate('products', 'name stockQuantity price imageUrl');
    if (!pack) {
      res.status(404).json({ message: 'Pack not found' });
      return;
    }

    const subProducts = pack.products as any[];
    const calculatedStock = subProducts.length > 0 
      ? Math.min(...subProducts.map(p => p.stockQuantity))
      : 0;

    res.status(200).json({
      ...pack.toObject(),
      stockQuantity: calculatedStock
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving pack details', error });
  }
};

// 4. Delete a Pack (Admin Only)
export const deletePack = async (req: Request, res: Response): Promise<void> => {
  try {
    const pack = await Pack.findByIdAndDelete(req.params.id);
    if (!pack) {
      res.status(404).json({ message: 'Pack not found' });
      return;
    }
    res.status(200).json({ message: 'Pack successfully deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pack', error });
  }
};