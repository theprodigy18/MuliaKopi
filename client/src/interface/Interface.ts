
export interface User {
    uuid: string,
    email: string,
    name: string
}

export interface Admin extends Omit<User, 'email'> {
}

export interface Transaction {
    orderId: string,
    order: Pick<Order, 'uniqueCode' | 'recipientName' | 'orderItems' | 'userId'>,
    adminId: string,
    admin: Pick<Admin, 'name'>,
    totalPrice: number,
    paymentMethod: string,
    createdAt: string
}

export interface DailyReportData {
    todayOrders: number,
    yesterdayOrders: number,
    todayRevenue: number,
    yesterdayRevenue: number
}

export interface Order {
    uuid: string,
    uniqueCode: string,
    userId?: string,
    recipientName: string,
    paymentStatus: boolean,
    orderItems: OrderItem[],
    createdAt: string
    updatedAt: string
}

export interface CartItem {
    id: number;
    userId: string;
    menuId: string;
    menu: Pick<MenuData, 'name' | 'price' | 'image'>;
    quantity: number;
    subPrice: number;
}

export interface AdminCart extends Omit<CartItem, 'userId' | 'menu'> {
    menu: Pick<MenuData, 'name' | 'price' | 'image' | 'id'>
}

export interface OrderItem extends Omit<CartItem, 'userId'> {
    orderId: string;
}

export interface MenuData {
    id: string,
    name: string,
    category: string,
    image: string,
    description: string,
    price: number
}

export interface RecommendationData {
    id: number,
    scanId: number,
    menuId: string,
    menu: Pick<MenuData, 'name' | 'price' | 'image' | 'category'>
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginData {
    email: string
    password: string
}


export interface Schedule {
    id: number;
    day: string;
    start: string;
    end: string;
}

export interface AdminLoginData {
    username: string;
    password: string;
}