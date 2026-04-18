import { asyncHandler } from '../../utils/asyncHandler.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body, res);
  res.status(201).json({ success: true, data });
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body, res);
  res.json({ success: true, data });
});

export const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req.cookies['refresh_token'], res);
  res.json({ success: true, data });
});

export const me = asyncHandler(async (req, res) => {
  const data = await authService.getMe(req.user.id);
  res.json({ success: true, data });
});

export const logout = asyncHandler(async (req, res) => {
  const data = await authService.logout(req.cookies['refresh_token'], res);
  res.json({ success: true, data });
});
