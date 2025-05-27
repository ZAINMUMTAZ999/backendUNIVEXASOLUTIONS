

// import { Request, Response, NextFunction } from 'express';

// interface User {
//     role: string;

//   }
  
//   declare global {
//     namespace Express {
//       interface Request {
//         user: User;
//       }
//     }
//   }
// type role = {
//   admin:"admin",
//   user:"user"
// }
//   export const authRoles = (...allowedRoles: role[]) => {
//     return (req: Request, res: Response, next: NextFunction): Promise<void> => {
//         console.log("authMiddlewareRole",req.user.role);
//       return new Promise((resolve, reject) => {
//         if (!allowedRoles.includes(req.user.role)) {
        
//           res.status(403).json({ message: 'Access denied' });
//           reject();
//         } else {
//           next();
//           resolve();
//         }
//       });
//     };
//   };









    
  

// // export default authorizeRoles;
import { Request, Response, NextFunction } from 'express';

interface User {
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User; // Made optional since user might not always be present
    }
  }
}

// Define roles as string literals or enum
enum Role {
  admin = "admin",
  user = "user"
}

// Alternative: using string union type
// type RoleType = "admin" | "user";

export const authRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log("authMiddlewareRole", req.user?.role);
    
    // Check if user exists
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    // Check if user role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    
    // User is authorized, proceed to next middleware
    next();
  };
};

// Alternative implementation with enum
// export const authRolesWithEnum = (...allowedRoles: Role[]) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     console.log("authMiddlewareRole", req.user?.role);
    
//     if (!req.user) {
//       res.status(401).json({ message: 'User not authenticated' });
//       return;
//     }
    
//     if (!allowedRoles.includes(req.user.role as Role)) {
//       res.status(403).json({ message: 'Access denied' });
//       return;
//     }
    
//     next();
//   };
// };

// Usage examples:
// app.get('/admin', authRoles('admin'), (req, res) => { ... });
// app.get('/user-or-admin', authRoles('user', 'admin'), (req, res) => { ... });
// app.get('/admin-only', authRolesWithEnum(Role.ADMIN), (req, res) => { ... });