import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories = new BehaviorSubject<Category[]>([]);
  private readonly STORAGE_KEY = 'categories';

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    const storedCategories = localStorage.getItem(this.STORAGE_KEY);
    if (storedCategories) {
      const categories = JSON.parse(storedCategories).map((cat: any) => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt)
      }));
      this.categories.next(categories);
    } else {
      // Initialize with default categories
      const defaultCategories: Category[] = [
        {
          id: '1',
          name: 'Food',
          color: '#10B981',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Transportation',
          color: '#3B82F6',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Housing',
          color: '#8B5CF6',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '4',
          name: 'Utilities',
          color: '#F59E0B',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '5',
          name: 'Entertainment',
          color: '#EC4899',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '6',
          name: 'Shopping',
          color: '#6366F1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '7',
          name: 'Healthcare',
          color: '#EF4444',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '8',
          name: 'Other',
          color: '#6B7280',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      this.categories.next(defaultCategories);
      this.saveCategories(defaultCategories);
    }
  }

  private saveCategories(categories: Category[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
  }

  getCategories(): Observable<Category[]> {
    return this.categories.asObservable();
  }

  addCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const currentCategories = this.categories.value;
    this.categories.next([...currentCategories, newCategory]);
    this.saveCategories(this.categories.value);
  }

  updateCategory(id: string, updates: Partial<Category>): void {
    const currentCategories = this.categories.value;
    const updatedCategories = currentCategories.map(category => {
      if (category.id === id) {
        return {
          ...category,
          ...updates,
          updatedAt: new Date()
        };
      }
      return category;
    });
    this.categories.next(updatedCategories);
    this.saveCategories(updatedCategories);
  }

  deleteCategory(id: string): void {
    const currentCategories = this.categories.value;
    const updatedCategories = currentCategories.filter(category => category.id !== id);
    this.categories.next(updatedCategories);
    this.saveCategories(updatedCategories);
  }
} 