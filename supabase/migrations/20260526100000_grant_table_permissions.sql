-- Grant table permissions to authenticated role
grant select, insert, update, delete on public.bikes to authenticated;
grant select, insert, update, delete on public.rides to authenticated;
