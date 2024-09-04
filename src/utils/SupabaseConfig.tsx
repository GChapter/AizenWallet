/* eslint-disable prettier/prettier */
import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';

export const supabase = createClient(
  'https://vjyeclwtelazqwgedviu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqeWVjbHd0ZWxhenF3Z2Vkdml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg3MDIwNjMsImV4cCI6MjAzNDI3ODA2M30.TZiO38XJcCnDhUFC-fzjY_APgmFzTf79JEqWIGS0TSg',
);
