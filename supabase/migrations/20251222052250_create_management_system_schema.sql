/*
  # Personal and Professional Management System - Complete Schema

  ## Overview
  This migration creates a comprehensive management system with four main areas:
  1. Areas and Resources (Finances, Learning, Networking)
  2. Strategic Objectives (OKR system)
  3. Projects (Transversal Kanban/Scrum)
  4. Habits and Routines

  ## New Tables

  ### 1. Areas and Resources

  #### `transactions`
  - Financial transaction tracking
  - Columns: id, user_id, date, amount, type (income/expense), category, method, note, created_at
  - RLS: Users can only access their own transactions

  #### `financial_goals`
  - Financial goal tracking
  - Columns: id, user_id, objective, target_amount, target_date, status, progress_percentage, created_at
  - RLS: Users can only access their own goals

  #### `library_items`
  - Learning resources (articles, courses, notes)
  - Columns: id, user_id, title, type, topic, source, link, tags, summary, insight, status, created_at
  - RLS: Users can only access their own library

  #### `professional_contacts`
  - Networking contacts
  - Columns: id, user_id, name, company, role, last_contact, next_contact, notes, industry, created_at
  - RLS: Users can only access their own contacts

  #### `work_projects_inventory`
  - Contextual inventory of work projects (not execution)
  - Columns: id, user_id, name, area, status, owner, stakeholders, context, links, created_at
  - RLS: Users can only access their own inventory

  ### 2. Strategic Objectives

  #### `objectives`
  - OKR/SMART objectives
  - Columns: id, user_id, objective, area (personal/professional), period, priority, status, description, created_at
  - RLS: Users can only access their own objectives

  #### `key_results`
  - Key results for objectives
  - Columns: id, user_id, objective_id, key_result, metric, baseline, target, target_date, progress_percentage, created_at
  - RLS: Users can only access their own key results

  ### 3. Projects (Transversal)

  #### `projects`
  - Unified project management for all areas
  - Columns: id, user_id, name, area, type, status, priority, start_date, deadline, owner, stakeholders, 
  -          expected_impact, risks, notes, created_at
  - Relations: objectives, key_results
  - RLS: Users can only access their own projects

  #### `tasks`
  - Scrum/Kanban tasks
  - Columns: id, user_id, project_id, task, status, priority, estimation, sprint, assigned_to, 
  -          deadline, tags, blockers, created_at
  - RLS: Users can only access their own tasks

  #### `sprints`
  - Sprint management (optional)
  - Columns: id, user_id, sprint_number, period_start, period_end, goals, capacity, notes, created_at
  - RLS: Users can only access their own sprints

  ### 4. Habits and Routines

  #### `habits`
  - Habit definitions
  - Columns: id, user_id, habit, category, frequency, trigger, action, reward, metric_type, 
  -          active, consistency_score, created_at
  - RLS: Users can only access their own habits

  #### `habit_logs`
  - Daily habit tracking
  - Columns: id, user_id, habit_id, log_date, completed, value, note, energy_level, created_at
  - RLS: Users can only access their own logs

  ### Relationship Tables

  #### `project_objectives`
  - Many-to-many relationship between projects and objectives

  #### `project_key_results`
  - Many-to-many relationship between projects and key results

  #### `habit_objectives`
  - Many-to-many relationship between habits and objectives

  #### `habit_key_results`
  - Many-to-many relationship between habits and key results

  #### `project_library_items`
  - Many-to-many relationship between projects and library resources

  ## Security
  - RLS enabled on all tables
  - Policies ensure users can only access their own data
  - Authenticated users only
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. AREAS AND RESOURCES
-- =============================================

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  amount decimal(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  method text,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Financial goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  objective text NOT NULL,
  target_amount decimal(12,2) NOT NULL,
  target_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  progress_percentage int DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own financial goals"
  ON financial_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Library items table
CREATE TABLE IF NOT EXISTS library_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('article', 'course', 'book', 'video', 'note', 'other')),
  topic text,
  source text,
  link text,
  tags text[],
  summary text,
  insight text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own library items"
  ON library_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Professional contacts table
CREATE TABLE IF NOT EXISTS professional_contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  role text,
  last_contact date,
  next_contact date,
  notes text,
  industry text,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE professional_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own professional contacts"
  ON professional_contacts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Work projects inventory table
CREATE TABLE IF NOT EXISTS work_projects_inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  area text DEFAULT 'professional' CHECK (area IN ('personal', 'professional')),
  status text DEFAULT 'idea' CHECK (status IN ('idea', 'active', 'archived')),
  owner text,
  stakeholders text[],
  context text,
  links text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE work_projects_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own work projects inventory"
  ON work_projects_inventory FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 2. STRATEGIC OBJECTIVES
-- =============================================

-- Objectives table (OKR)
CREATE TABLE IF NOT EXISTS objectives (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  objective text NOT NULL,
  area text NOT NULL CHECK (area IN ('personal', 'professional')),
  period text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'on_track', 'at_risk', 'completed', 'cancelled')),
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own objectives"
  ON objectives FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Key results table
CREATE TABLE IF NOT EXISTS key_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  objective_id uuid NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  key_result text NOT NULL,
  metric text NOT NULL,
  baseline decimal(12,2) DEFAULT 0,
  target decimal(12,2) NOT NULL,
  current_value decimal(12,2) DEFAULT 0,
  target_date date,
  progress_percentage int DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own key results"
  ON key_results FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 3. PROJECTS (TRANSVERSAL)
-- =============================================

-- Projects table (unified for all types)
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  area text NOT NULL CHECK (area IN ('personal', 'professional')),
  type text CHECK (type IN ('work', 'personal', 'learning', 'other')),
  status text DEFAULT 'backlog' CHECK (status IN ('backlog', 'in_progress', 'blocked', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  start_date date,
  deadline date,
  owner text,
  stakeholders text[],
  expected_impact text,
  risks text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tasks table (Scrum/Kanban)
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  task text NOT NULL,
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimation int,
  sprint text,
  assigned_to text,
  deadline date,
  tags text[],
  blockers text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_number int NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  goals text,
  capacity int,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sprints"
  ON sprints FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. HABITS AND ROUTINES
-- =============================================

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit text NOT NULL,
  category text NOT NULL CHECK (category IN ('health', 'language', 'productivity', 'learning', 'other')),
  frequency text DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  trigger text,
  action text,
  reward text,
  metric_type text DEFAULT 'boolean' CHECK (metric_type IN ('boolean', 'minutes', 'repetitions', 'count')),
  active boolean DEFAULT true,
  consistency_score int DEFAULT 0 CHECK (consistency_score >= 0 AND consistency_score <= 100),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habits"
  ON habits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habit logs table
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  value decimal(10,2),
  note text,
  energy_level int CHECK (energy_level >= 1 AND energy_level <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, habit_id, log_date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habit logs"
  ON habit_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 5. RELATIONSHIP TABLES
-- =============================================

-- Project-Objectives relationship
CREATE TABLE IF NOT EXISTS project_objectives (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  objective_id uuid NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, objective_id)
);

ALTER TABLE project_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own project objectives"
  ON project_objectives FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Project-Key Results relationship
CREATE TABLE IF NOT EXISTS project_key_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key_result_id uuid NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, key_result_id)
);

ALTER TABLE project_key_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own project key results"
  ON project_key_results FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habit-Objectives relationship
CREATE TABLE IF NOT EXISTS habit_objectives (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  objective_id uuid NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, objective_id)
);

ALTER TABLE habit_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habit objectives"
  ON habit_objectives FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habit-Key Results relationship
CREATE TABLE IF NOT EXISTS habit_key_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  key_result_id uuid NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, key_result_id)
);

ALTER TABLE habit_key_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habit key results"
  ON habit_key_results FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Project-Library Items relationship
CREATE TABLE IF NOT EXISTS project_library_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  library_item_id uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, library_item_id)
);

ALTER TABLE project_library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own project library items"
  ON project_library_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_library_items_user_status ON library_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_project ON tasks(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_key_results_objective ON key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_professional_contacts_user ON professional_contacts(user_id, next_contact);
