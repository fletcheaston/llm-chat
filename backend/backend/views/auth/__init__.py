from ninja import Router

from . import github, logout, who_am_i

router = Router()


router.add_router("", who_am_i.router, tags=["auth"])
router.add_router("", logout.router, tags=["auth"])
router.add_router("", github.router, tags=["auth"])
