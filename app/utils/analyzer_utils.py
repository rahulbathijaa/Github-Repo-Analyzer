def extract_user_profile(user):
    profile = {
        'login': user['login'],
        'name': user.get('name'),
        'avatarUrl': user['avatarUrl'],
        'bio': user.get('bio'),
        'createdAt': user['createdAt'],
        'followers': user['followers']['totalCount'],
        'following': user['following']['totalCount'],
    }
    return profile
